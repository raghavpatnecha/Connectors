# Connectors Platform Deep Review

_Date: 22 Nov 2024 — Scope: Gateway, Python SDK, and all 14 connectors_

## 1. Executive Summary

* The gateway + SDK architecture is cohesive: the Python SDK (`python-sdk/connectors/*.py`) talks to `/api/v1` routes in `gateway/src/server.ts`, which delegate to the FAISS-based `SemanticRouter` and OAuth-aware `OAuthProxy`.
* Critical blockers uncovered:
  1. **OAuth state handling is broken across every Google connector.** `OAuthManager.generateAuthUrl()` embeds the tenant ID in `state`, but each connector’s HTTP callback (e.g., `integrations/communication/gmail-unified/src/index.ts`, `integrations/storage/drive-unified/src/index.ts`) blindly treats `state` as the tenant ID. Credentials are stored under keys such as `tenant:timestamp:nonce`, so later tool invocations using the real tenant ID never find them.
  2. **Vault storage does not match the docs.** Documentation promises per-tenant encryption via Vault Transit (see `docs/04-integrations/*`), but the Google + GitHub connector Vault clients simply write raw tokens to KV (`integrations/shared/google-auth/vault-client.ts`, `integrations/code/github-unified/src/auth/vault-client.ts`). Only the gateway, Reddit, and Product Hunt connectors actually use Transit encryption.
  3. **LinkedIn connector is non-functional.** `registerTools()` in `integrations/communication/linkedin-unified/src/index.ts` calls a placeholder `getClient` that throws `"Client retrieval not yet implemented"`. Session handling uses deprecated crypto APIs and assumes OAuth tokens can be turned into LinkedIn cookies, which is incorrect.
  4. **Management endpoints are exposed without auth.** Product Hunt’s `/token/set` and `/token/revoke` endpoints (in `integrations/productivity/producthunt-unified/src/index.ts`) accept arbitrary token updates from anyone on the network. OAuth authorize endpoints for other connectors also lack CSRF/state validation.
* Strengths: gateway validation + rate limiting are solid, Reddit/Product Hunt connectors implement Vault transit encryption correctly, and the Python SDK has robust retry logic.

## 2. Architecture & Request Flow

1. **SDK → Gateway**
   * `Connectors.tools.select()` / `invoke()` (`python-sdk/connectors/tools.py`) POST to `/api/v1/tools/select` and `/api/v1/tools/invoke` respectively, using `HTTPClient` with retries/backoff and automatic headers (API key + tenant ID).

2. **Gateway pipeline (`gateway/src/server.ts`):**
   * `/api/v1/tools/select` validates payloads, constructs optional helpers (`ToolSchemaLoader`, `WorkflowPlanner`, `ConnectionStatusChecker`), and calls `SemanticRouter.selectTools()` (single) or `_processBatchQueries()` (batch).
   * `/api/v1/tools/invoke` validates `toolId`/`integration`/`tenantId`, then hands off to `OAuthProxy.proxyRequest()`.

3. **Routing & Auth:**
   * `SemanticRouter` (`gateway/src/routing/semantic-router.ts`) performs two-level FAISS searches, caches hits in Redis, and optimizes token usage.
   * `OAuthProxy` (`gateway/src/auth/oauth-proxy.ts`) fetches credentials from `VaultClient`, injects auth headers, retries 401s with mutex-protected refresh, and forwards the call to `/integrations/{integration}...`.

4. **Connector servers (`integrations/*`):**
   * Each connector runs its own MCP `Server` (stdio transport) plus an HTTP server for OAuth/token setup. Tools are registered via per-connector `ToolRegistry` helpers (usually zod-based) that invoke API clients and return JSON payloads as MCP text content.

## 3. Documentation vs Implementation

| Doc Claim | Actual Code | Impact |
| --- | --- | --- |
| Per-tenant encryption via Vault Transit for all connectors (docs/04-integrations/*) | Google + GitHub connectors store raw tokens in KV (no Transit, no metadata). | Security + compliance gap; docs are misleading.
| LinkedIn connector has 18 working tools and 148 tests (`docs/04-integrations/communication/linkedin.md`). | `getClient` throws, automation relies on fabricated cookies, and connector can’t execute any tool. | Docs are inaccurate; integration should be marked experimental or disabled.
| Product Hunt management endpoints are “secure via Vault”. | `/token/set` accepts any unauthenticated POST and overwrites tenant API tokens. | Tokens can be hijacked; docs should mention required auth.
| `/api/v1/tools/list` returns full metadata as described in docs. | Implementation simply dumps cached embeddings with synthetic token cost. | Users can’t discover OAuth scopes/categories from the endpoint as promised.

## 4. Per-Connector Observations (14 total)

1. **GitHub (code/github-unified)**
   * ✅ Uses Octokit + comprehensive tool sets.
   * ⚠ Vault client stores plaintext tokens and `ToolRegistry` defaults to tenant `"default"` if not provided.

2. **Gmail (communication/gmail-unified)**
   * ✅ Rich tool coverage with zod schemas.
   * ⚠ OAuth `state` bug, manual `tools/list` drift, `GoogleClientFactory` unused.

3. **Google Chat (communication/chat-unified)**
   * ✅ Well-structured category modules.
   * ⚠ OAuth bug, duplicate token fetch (`getAuthenticatedClient` + `auth.getAccessToken()`), no error mapping.

4. **LinkedIn (communication/linkedin-unified)**
   * ❌ Tool registry never obtains a usable client; connector always throws.
   * ⚠ Deprecated crypto, unrealistic cookie handling.

5. **Reddit (communication/reddit-unified)**
   * ✅ Proper Vault transit encryption, rate limiter, cache.
   * ⚠ `_scheduleAutoRefresh` only logs intent; OAuth callback doesn’t validate state.

6. **Docs/Drive/Sheets/Slides (documents/*, storage/drive-unified)**
   * ✅ Deep tool coverage.
   * ⚠ Same OAuth bug; watchers/export tools advertised but not implemented as described; binary outputs always returned as text.

7. **Calendar/Forms/Tasks (productivity/*)**
   * ✅ Clean zod schemas.
   * ⚠ Same OAuth issue, repeated HTTP server boilerplate, missing pagination/sync handling.

8. **Product Hunt (productivity/producthunt-unified)**
   * ✅ Transit encryption + GraphQL client.
   * ⚠ `/token/set` unauthenticated; HTTP server should be behind auth/reverse proxy.

9. **Google Search (search/google-search-unified)**
   * ✅ Web/image/news search tools.
   * ⚠ OAuth bug despite API only needing an API key; docs mention CSE management that isn’t implemented.

## 5. Key Recommendations

1. **Fix OAuth state handling everywhere.** Use `OAuthManager.extractTenantIdFromState(state)` (or equivalent) and verify against stored pending states before calling `handleCallback`. This applies to every Google-based connector, Product Hunt, and Reddit.
2. **Align Vault storage with doc guarantees.** Either move connectors to the secure Vault client used by the gateway/Reddit/Product Hunt or update docs until transit encryption is in place.
3. **Secure management endpoints.** Lock `/token/set` (Product Hunt) and similar helper routes behind API keys or restrict them to internal networks. Add CSRF protection + state validation for OAuth authorize endpoints.
4. **Address LinkedIn connector status.** Finish the unified client implementation or mark the integration as experimental/offline in both docs and registry until it functions.
5. **Generate tool metadata dynamically.** `ToolRegistry` already tracks registrations; expose an API/command to dump tool definitions instead of maintaining long manual lists which easily drift from reality.
6. **Centralize Google connector scaffolding.** Extract shared HTTP server/OAuth logic, implement real watch/export support where documented, and add rate-limit handling similar to the gateway.
7. **Improve telemetry + tests.** The gateway `/api/v1/metrics` currently returns zeroes—wire it up to actual counters. Expand connector tests beyond snapshot stubs to ensure payload correctness (especially for Google APIs).

## 6. Next Steps

* Apply OAuth state fixes and credential storage changes before shipping the connectors.
* Update documentation once the above is resolved, or note any temporary limitations.
* Consider routing OAuth/token management through the gateway to avoid per-connector HTTP services entirely.
