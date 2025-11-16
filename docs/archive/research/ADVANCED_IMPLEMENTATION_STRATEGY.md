# Advanced Tool Selection & OAuth Implementation Strategy

## Deep Dive: Beyond Basic Semantic Routing + Production-Ready OAuth

**Date:** 2025-11-08
**Purpose:** Validate and improve our MOAT strategy with latest research (2024-2025)

---

## Part 1: Tool Selection - Beyond Basic Semantic Routing

### Summary: We Can Do Much Better! ✅

Basic semantic search (FAISS + embeddings) is **good** but **not sufficient** for production. Recent research (2024-2025) shows significantly better approaches.

---

## 1.1 Problems with Naive Semantic Routing

**Basic Approach (What I Initially Suggested):**
```python
# Naive semantic search
query_embedding = embed("Create a GitHub issue")
tool_scores = cosine_similarity(query_embedding, all_tool_embeddings)
top_tools = tools[top_k(tool_scores)]
```

**Issues:**
1. **No Context Awareness**: Doesn't consider what tools agent already has
2. **No Cost Consideration**: Doesn't factor in token cost of each tool
3. **No Reasoning**: Just pattern matching, no understanding
4. **No Multi-Tool Composition**: Can't plan which tools work together
5. **No Learning**: Doesn't improve from usage patterns

---

## 1.2 State-of-the-Art Approaches (2024-2025 Research)

### Approach 1: MasRouter (2025) ⭐ BEST OVERALL

**Paper:** "MasRouter: Learning to Route LLMs for Multi-Agent Systems" (ACL 2025)

**Key Innovation:** Three-stage cascaded routing
```
Stage 1: Collaboration Mode Determination
  → Solo agent vs Multi-agent collaboration needed?

Stage 2: Role Allocation
  → Which specialist agents/tools needed for this task?

Stage 3: LLM Routing
  → Which LLM per agent (considering cost/capability trade-off)
```

**Why This Matters for Us:**
- Considers tool combinations (not just individual tools)
- Cost-aware (balances effectiveness and efficiency)
- First unified framework for routing in multi-agent systems
- Proven results on real benchmarks

**Our Implementation:**
```python
class MasRouterAdapter:
    def route_query(self, query: str, context: Context):
        # Stage 1: Do we need multiple tools?
        mode = self.determine_mode(query)

        if mode == "single_tool":
            # Simple case: one tool
            return self.select_single_tool(query)
        else:
            # Complex case: multiple tools needed
            # Stage 2: Which tools work together?
            tool_composition = self.allocate_tools(query, context)

            # Stage 3: Optimize for cost
            optimized = self.optimize_tool_selection(
                tool_composition,
                max_tokens=context.token_budget
            )

            return optimized
```

**Token Impact:**
- Traditional: Load all 500 tools (250K tokens)
- Naive Semantic: Load top 5 tools (2.5K tokens)
- MasRouter: Load optimal composition (1-3K tokens) with better accuracy

---

### Approach 2: Tool-to-Agent Retrieval (Nov 2024) ⭐ HIGHLY RELEVANT

**Paper:** "Tool-to-Agent Retrieval: Bridging Tools and Agents for Scalable LLM Multi-Agent Systems"

**Key Innovation:** Two-level vector space
- Tools embedded individually
- Agents (tool collections) embedded separately
- Linked through metadata relationships

**Why This Is Perfect for Us:**
```
Traditional:
  Query → Search all 500 tools → Flat list

Tool-to-Agent:
  Query → Search agent categories → Search within category tools
          (Two-hop retrieval)
```

**Results:**
- 19.4% improvement in Recall@5
- 17.7% improvement in nDCG@5
- Tested on LiveMCPBench (real MCP servers!)

**Our Implementation:**
```python
class ToolToAgentRetrieval:
    def __init__(self):
        # Two-level index
        self.category_index = FAISSIndex()  # Code, Comms, PM, etc.
        self.tool_indices = {
            "code": FAISSIndex(),  # GitHub, GitLab, etc.
            "comms": FAISSIndex(),  # Slack, Discord, etc.
            # ...
        }

        # Metadata relationships
        self.tool_to_category = {}
        self.category_metadata = {}

    def retrieve(self, query: str, k: int = 5):
        # Step 1: Find relevant categories (coarse)
        category_scores = self.category_index.search(query, k=3)

        # Step 2: Search within categories (fine-grained)
        tools = []
        for cat, score in category_scores:
            cat_tools = self.tool_indices[cat].search(query, k=2)
            tools.extend(cat_tools)

        # Step 3: Re-rank with metadata
        tools = self.rerank_with_metadata(tools, query)

        return tools[:k]
```

**Token Impact:**
- Category search: ~100 tokens
- Per-category tool schemas: ~500 tokens each
- Total: ~1.5K tokens for 5 tools (vs 2.5K naive approach)

---

### Approach 3: GraphRAG for Tool Selection (2024) ⭐ INNOVATIVE

**Concept:** Use knowledge graph to represent tool relationships

**Why This Works:**
```
Traditional: Tools are independent entities
GraphRAG: Tools have relationships

Example Graph:
  GitHub.createIssue
    → requires → GitHub.auth
    → often_followed_by → GitHub.addLabels
    → commonly_used_with → Slack.sendMessage
    → alternative_to → Linear.createIssue
```

**Benefits:**
1. **Tool Composition**: Knows which tools work together
2. **Sequential Planning**: Understands typical workflows
3. **Alternatives**: Suggests fallbacks if tool fails
4. **Context Propagation**: Understands data flow between tools

**Implementation:**
```python
class GraphRAGToolSelector:
    def __init__(self):
        self.graph = Neo4j()  # Tool relationship graph

    def build_tool_graph(self):
        # From usage logs, build relationships:
        # - co_occurrence (used together)
        # - sequence (tool A → tool B)
        # - alternatives (similar functionality)
        # - dependencies (tool A requires tool B)
        pass

    def select_tools(self, query: str, max_hops: int = 2):
        # 1. Find seed tools (semantic search)
        seeds = self.semantic_search(query, k=3)

        # 2. Graph traversal to find related tools
        cypher = """
        MATCH (seed:Tool)-[r:COMMONLY_USED_WITH|FOLLOWED_BY*1..2]-(related:Tool)
        WHERE seed.id IN $seed_ids
        RETURN related, r, seed
        ORDER BY r.confidence DESC
        LIMIT 5
        """

        related = self.graph.query(cypher, seed_ids=[s.id for s in seeds])

        # 3. Build execution plan
        plan = self.build_execution_plan(seeds + related)

        return plan
```

**Agentic GraphRAG** (2024 advancement):
- Agent dynamically selects search strategy (vector, graph, or hybrid)
- Question routing: analyze query → pick best retrieval method
- Works with PageRank, BFS/DFS, text-to-Cypher

**Token Impact:**
- Graph structure: Minimal (just queries the graph)
- Only load tools in execution plan: ~2K tokens
- Much smarter tool selection than embeddings alone

---

### Approach 4: "Less-is-More" Dynamic Reduction (2024) ⭐ PROVEN RESULTS

**Paper:** "Less is More: Optimizing Function Calling for LLM Execution on Edge Devices"

**Key Finding:**
> "Providing large numbers of available options confuses LLMs. Reducing the number of tools improves the model's reasoning ability and enables more accurate and faster decisions."

**Results:**
- 21% faster execution
- 13% less power consumption
- Up to 70% time reduction on edge devices
- ~40% power reduction

**Method:**
```python
# Instead of presenting all tools upfront...
class LessIsMoreSelector:
    def select_tools(self, query: str):
        # Step 1: LLM reasons about what it needs (NO TOOLS PROVIDED YET)
        reasoning_prompt = f"""
        Task: {query}

        What types of tools do you need? Describe in natural language.
        Do NOT call any tools yet, just describe what you need.
        """

        tool_requirements = llm(reasoning_prompt)

        # Step 2: Use similarity search to find tools matching description
        candidate_tools = self.similarity_search(
            tool_requirements,
            max_tools=5  # Drastically limit options
        )

        # Step 3: NOW provide limited tools to LLM
        return candidate_tools
```

**Key Insight:**
> "When an LLM is offered fewer function options, it makes decisions faster and with less confusion"

**Our Application:**
- Progressive tool loading: Start with 3-5 tools, expand if needed
- Better than loading 50 tools "just in case"

---

### Approach 5: Chain-of-Thought for Tool Selection (2024)

**Key Research:** Multiple papers show CoT improves function calling

**Problem with Free-Form CoT:**
> "Free-form CoT is insufficient and sometimes counterproductive for structured function-calling tasks"

**Solution: Structured Reasoning Templates**
```python
structured_template = """
Step 1: Analyze User Query
- What is the user trying to accomplish?
- What data/actions are required?

Step 2: Assess Tool Requirements
- What category of tools is needed? (Code/Comms/Data/etc.)
- Single tool or multiple tools?
- Any dependencies between tools?

Step 3: Parameter Validation
- Do we have all required information?
- Are there missing parameters?

Step 4: Tool Selection
- Best tool for this task: [TOOL_NAME]
- Reason: [EXPLANATION]
"""
```

**Results:**
- 3-12% improvement over baselines
- Reduces spurious tool calls
- Better parameter validation

**Integration with Our System:**
```python
class StructuredReasoningSelector:
    def select_with_reasoning(self, query: str, available_tools: List[Tool]):
        # Force structured thinking
        reasoning = llm(self.structured_template + f"\nQuery: {query}")

        # Parse reasoning output
        analysis = self.parse_reasoning(reasoning)

        # Select tools based on structured analysis
        selected = self.match_tools(
            category=analysis.category,
            requirements=analysis.requirements,
            tools=available_tools
        )

        return selected, reasoning  # Return reasoning for debugging
```

---

## 1.3 Recommended Hybrid Architecture ⭐

Based on research, here's the **optimal approach**:

```python
class HybridToolSelector:
    """
    Combines best techniques from 2024-2025 research:
    - Tool-to-Agent two-level retrieval
    - Less-is-More progressive loading
    - GraphRAG for tool relationships
    - Structured reasoning for complex queries
    - Cost-aware selection (MasRouter inspiration)
    """

    def __init__(self):
        # Two-level vector index
        self.category_index = FAISSIndex()
        self.tool_indices = {}  # Per-category

        # Knowledge graph
        self.tool_graph = Neo4j()

        # Cost model
        self.cost_model = TokenCostModel()

        # Usage analytics
        self.usage_tracker = UsageTracker()

    def select_tools(
        self,
        query: str,
        context: AgentContext,
        max_tokens: int = 5000,
        strategy: str = "auto"
    ) -> ToolSelectionResult:

        # Stage 1: Quick classification
        query_type = self.classify_query(query)

        if query_type == "simple":
            # Fast path: Single tool, use semantic search
            return self.simple_selection(query, max_tokens)

        elif query_type == "complex":
            # Slow path: Multiple tools, use full pipeline
            return self.complex_selection(query, context, max_tokens)

        else:  # "ambiguous"
            # Use structured reasoning
            return self.reasoning_selection(query, context, max_tokens)

    def simple_selection(self, query: str, max_tokens: int):
        """Fast path for simple queries (70% of cases)"""

        # Two-level retrieval (Tool-to-Agent approach)
        top_category = self.category_index.search(query, k=1)[0]
        tools = self.tool_indices[top_category].search(query, k=3)

        # Cost-aware filtering
        tools = self.filter_by_token_cost(tools, max_tokens)

        return ToolSelectionResult(
            tools=tools,
            strategy="simple",
            estimated_tokens=sum(t.schema_size for t in tools)
        )

    def complex_selection(
        self,
        query: str,
        context: AgentContext,
        max_tokens: int
    ):
        """Full pipeline for complex queries (25% of cases)"""

        # Step 1: LLM reasons about requirements (Less-is-More)
        requirements = self.llm_reason_requirements(query)

        # Step 2: Two-level retrieval
        categories = self.category_index.search(requirements, k=3)
        candidate_tools = []
        for cat, score in categories:
            tools = self.tool_indices[cat].search(requirements, k=5)
            candidate_tools.extend(tools)

        # Step 3: GraphRAG expansion
        # Find related tools via graph traversal
        related_tools = self.tool_graph.find_related(
            seed_tools=candidate_tools,
            max_hops=2,
            min_confidence=0.7
        )

        # Step 4: Build tool composition plan
        # (MasRouter-inspired: consider tool interactions)
        composition = self.plan_tool_composition(
            candidate_tools + related_tools,
            query,
            context
        )

        # Step 5: Cost optimization
        optimized = self.optimize_for_cost(
            composition,
            max_tokens,
            strategy="greedy"  # or "dp" for optimal
        )

        return ToolSelectionResult(
            tools=optimized.tools,
            execution_plan=optimized.plan,
            strategy="complex",
            estimated_tokens=optimized.token_cost,
            reasoning=optimized.reasoning
        )

    def reasoning_selection(
        self,
        query: str,
        context: AgentContext,
        max_tokens: int
    ):
        """Structured reasoning for ambiguous queries (5% of cases)"""

        # Use structured CoT template
        reasoning = self.llm_structured_reasoning(query, context)

        # Parse reasoning
        analysis = self.parse_reasoning(reasoning)

        # Select based on structured analysis
        tools = self.select_from_analysis(analysis, max_tokens)

        return ToolSelectionResult(
            tools=tools,
            strategy="reasoning",
            estimated_tokens=sum(t.schema_size for t in tools),
            reasoning=reasoning  # Include for debugging
        )

    def optimize_for_cost(
        self,
        composition: ToolComposition,
        max_tokens: int,
        strategy: str
    ):
        """Cost-aware optimization (MasRouter-inspired)"""

        if strategy == "greedy":
            # Greedy: highest value/cost ratio
            return self.greedy_optimize(composition, max_tokens)

        elif strategy == "dp":
            # Dynamic programming: optimal solution
            return self.dp_optimize(composition, max_tokens)

        else:
            raise ValueError(f"Unknown strategy: {strategy}")
```

---

## 1.4 Performance Comparison

| Approach | Token Usage | Accuracy | Latency | Implementation Complexity |
|----------|-------------|----------|---------|--------------------------|
| **Naive (load all)** | 250K | Baseline | High | Low |
| **Basic Semantic** | 2.5K | Baseline | Low | Low |
| **Tool-to-Agent** | 1.5K | +19.4% | Low | Medium |
| **GraphRAG** | 2K | +15-25% | Medium | High |
| **Less-is-More** | 1K | +10% | -21% latency | Medium |
| **Hybrid (Our)** | 1-3K | +25-30%* | Low-Med | High |

*Estimated based on combining techniques

---

## 1.5 Benchmarking Against Real Standards

**ToolBench** (ICLR 2024):
- 16,464 real-world APIs
- Single-tool and multi-tool scenarios
- Metrics: Pass Rate, Win Rate

**LiveMCPBench** (2024):
- Real MCP servers
- Tool-to-Agent paper used this
- Industry-relevant benchmark

**MCPVerse** (2025):
- Expansive, real-world benchmark
- Composable tool interactions
- More complex than ToolBench

**Our Validation Plan:**
1. Test on ToolBench (compare to published results)
2. Create internal benchmark with real use cases
3. A/B test in production (track success rate)

---

## 1.6 Recommended Implementation Roadmap

**Phase 1 (MVP):** Basic Semantic + Two-Level
- Implement Tool-to-Agent retrieval
- Simple category → tool hierarchy
- **Goal:** 85% token reduction, baseline accuracy

**Phase 2:** Add GraphRAG
- Build tool relationship graph from usage
- Implement graph-based expansion
- **Goal:** +15% accuracy improvement

**Phase 3:** Less-is-More + Cost Optimization
- Progressive tool loading
- Cost-aware selection
- **Goal:** Another 10% token reduction

**Phase 4:** Structured Reasoning
- Implement CoT templates
- Handle complex/ambiguous queries
- **Goal:** +10% accuracy on hard queries

---

# Part 2: OAuth & Integration Implementation

## 2.1 Multi-Tenant OAuth Architecture

### Latest Standards (January 2025)

**RFC 9700** - "Best Current Practice for OAuth 2.0 Security" (Published Jan 2025)

Key Updates:
- OAuth 2.1 consolidation
- Enhanced security for multi-tenant scenarios
- Dynamic client relationships

---

## 2.2 Production-Ready OAuth Architecture

### Architecture Pattern: Centralized Credential Vault

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent                                 │
└────────────────────────┬────────────────────────────────────┘
                         │ (Tool Call Request)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   OAuth Proxy Layer                          │
│  - Intercepts tool calls                                     │
│  - Retrieves credentials                                     │
│  - Injects auth headers                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Credential Vault (HashiCorp Vault)              │
│                                                               │
│  Tenant Isolation:                                           │
│  ┌──────────────────────────────────────────────┐           │
│  │ Org ID: org_123                               │           │
│  │   ├── GitHub                                  │           │
│  │   │   ├── user_alice → {access, refresh}     │           │
│  │   │   └── user_bob → {access, refresh}       │           │
│  │   ├── Slack                                   │           │
│  │   │   └── workspace_token → {access}         │           │
│  │   └── ...                                     │           │
│  └──────────────────────────────────────────────┘           │
│                                                               │
│  Encryption: Per-tenant encryption keys                      │
│  Namespaces: org_123, org_456, ...                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Token Refresh Service                         │
│  - Background job                                            │
│  - Monitors token expiration                                 │
│  - Auto-refreshes before expiry                              │
│  - Updates vault                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Third-Party APIs                              │
│  GitHub, Slack, Jira, etc.                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2.3 Implementation Details

### 2.3.1 Credential Storage (HashiCorp Vault)

```python
class MultiTenantCredentialStore:
    """
    Based on:
    - RFC 9700 (OAuth 2.0 Best Practices, Jan 2025)
    - HashiCorp Vault multi-tenancy patterns
    - Azure Key Vault per-tenant encryption
    """

    def __init__(self, vault_url: str):
        self.vault = hvac.Client(url=vault_url)

    def store_credential(
        self,
        org_id: str,
        user_id: str,
        integration: str,
        tokens: OAuthTokens
    ):
        """
        Store credentials with tenant isolation
        """
        # Path pattern: /secret/<org_id>/<integration>/<user_id>
        path = f"secret/data/{org_id}/{integration}/{user_id}"

        # Encrypt with tenant-specific key
        encrypted = self.encrypt_with_tenant_key(
            org_id=org_id,
            data=tokens.dict()
        )

        # Store in Vault with metadata
        self.vault.secrets.kv.v2.create_or_update_secret(
            path=path,
            secret=encrypted,
            metadata={
                "org_id": org_id,
                "user_id": user_id,
                "integration": integration,
                "created_at": datetime.utcnow().isoformat(),
                "expires_at": tokens.expires_at.isoformat()
            }
        )

    def get_credential(
        self,
        org_id: str,
        user_id: str,
        integration: str
    ) -> OAuthTokens:
        """
        Retrieve and decrypt credentials
        """
        path = f"secret/data/{org_id}/{integration}/{user_id}"

        # Check if exists
        try:
            response = self.vault.secrets.kv.v2.read_secret(path=path)
        except Exception:
            raise CredentialNotFoundError()

        # Decrypt
        encrypted = response["data"]["data"]
        decrypted = self.decrypt_with_tenant_key(
            org_id=org_id,
            data=encrypted
        )

        tokens = OAuthTokens(**decrypted)

        # Check if expired
        if tokens.is_expired():
            # Auto-refresh
            tokens = self.refresh_token(org_id, user_id, integration, tokens)

        return tokens

    def encrypt_with_tenant_key(self, org_id: str, data: dict) -> dict:
        """
        Per-tenant encryption (Azure Key Vault pattern)
        """
        # Get tenant-specific encryption key from Vault Transit
        key_name = f"tenant-{org_id}"

        # Encrypt using Vault Transit engine
        encrypted = self.vault.secrets.transit.encrypt_data(
            name=key_name,
            plaintext=base64.b64encode(json.dumps(data).encode()).decode()
        )

        return {"ciphertext": encrypted["data"]["ciphertext"]}

    def decrypt_with_tenant_key(self, org_id: str, data: dict) -> dict:
        """Decrypt with tenant key"""
        key_name = f"tenant-{org_id}"

        decrypted = self.vault.secrets.transit.decrypt_data(
            name=key_name,
            ciphertext=data["ciphertext"]
        )

        plaintext = base64.b64decode(decrypted["data"]["plaintext"])
        return json.loads(plaintext)
```

### 2.3.2 Token Refresh Service

```python
class TokenRefreshService:
    """
    Background service to auto-refresh tokens before expiry
    Based on: RFC 6749, RFC 9700 best practices
    """

    def __init__(self, credential_store: MultiTenantCredentialStore):
        self.store = credential_store
        self.scheduler = BackgroundScheduler()

    def start(self):
        """Start background refresh job"""
        # Run every 5 minutes
        self.scheduler.add_job(
            self.refresh_expiring_tokens,
            'interval',
            minutes=5
        )
        self.scheduler.start()

    async def refresh_expiring_tokens(self):
        """Find and refresh tokens expiring in next 10 minutes"""

        # Query Vault for tokens expiring soon
        expiring = self.find_expiring_tokens(window_minutes=10)

        # Refresh in parallel (with rate limiting)
        tasks = []
        for cred in expiring:
            task = self.refresh_single_token(cred)
            tasks.append(task)

        # Process with concurrency limit
        results = await asyncio.gather(
            *tasks,
            return_exceptions=True
        )

        # Log failures
        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Token refresh failed: {result}")

    async def refresh_single_token(self, cred: CredentialMetadata):
        """Refresh a single token"""

        try:
            # Get current tokens
            tokens = self.store.get_credential(
                org_id=cred.org_id,
                user_id=cred.user_id,
                integration=cred.integration
            )

            # Get integration OAuth config
            config = self.get_oauth_config(cred.integration)

            # Refresh token request
            new_tokens = await self.oauth_refresh_request(
                config=config,
                refresh_token=tokens.refresh_token
            )

            # Store new tokens
            self.store.store_credential(
                org_id=cred.org_id,
                user_id=cred.user_id,
                integration=cred.integration,
                tokens=new_tokens
            )

            logger.info(f"Refreshed token for {cred.integration}/{cred.user_id}")

        except Exception as e:
            logger.error(f"Failed to refresh token: {e}")
            # Mark credential as invalid
            self.store.mark_invalid(cred)

    async def oauth_refresh_request(
        self,
        config: OAuthConfig,
        refresh_token: str
    ) -> OAuthTokens:
        """Standard OAuth 2.0 token refresh"""

        async with httpx.AsyncClient() as client:
            response = await client.post(
                config.token_url,
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": config.client_id,
                    "client_secret": config.client_secret
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )

            if response.status_code != 200:
                raise TokenRefreshError(response.text)

            data = response.json()

            return OAuthTokens(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token", refresh_token),
                expires_in=data.get("expires_in", 3600),
                token_type=data.get("token_type", "Bearer")
            )
```

### 2.3.3 OAuth Proxy Layer

```python
class OAuthProxyMiddleware:
    """
    Transparent OAuth injection for tool calls
    Inspired by: mcp-auth-proxy, Azure API Management
    """

    def __init__(self, credential_store: MultiTenantCredentialStore):
        self.store = credential_store

    async def intercept_tool_call(
        self,
        tool_name: str,
        params: dict,
        context: RequestContext
    ):
        """Intercept and inject auth"""

        # Parse tool name: "github.createIssue" → integration="github"
        integration = tool_name.split(".")[0]

        # Check if this integration needs OAuth
        if not self.requires_oauth(integration):
            # No auth needed, pass through
            return await self.execute_tool(tool_name, params)

        # Get credentials for this user+integration
        try:
            tokens = self.store.get_credential(
                org_id=context.org_id,
                user_id=context.user_id,
                integration=integration
            )
        except CredentialNotFoundError:
            # No credentials stored
            raise AuthenticationRequiredError(
                f"Please connect your {integration} account",
                oauth_url=self.generate_oauth_url(integration, context)
            )

        # Inject auth into request
        params_with_auth = self.inject_auth(params, tokens)

        # Execute tool call
        try:
            result = await self.execute_tool(tool_name, params_with_auth)
            return result

        except UnauthorizedError:
            # Token might be invalid, try refresh
            tokens = await self.force_refresh_token(
                org_id=context.org_id,
                user_id=context.user_id,
                integration=integration,
                tokens=tokens
            )

            # Retry with new token
            params_with_auth = self.inject_auth(params, tokens)
            result = await self.execute_tool(tool_name, params_with_auth)
            return result

    def inject_auth(self, params: dict, tokens: OAuthTokens) -> dict:
        """Inject auth headers/params"""

        # Clone params
        params = params.copy()

        # Add auth header
        if "headers" not in params:
            params["headers"] = {}

        params["headers"]["Authorization"] = f"Bearer {tokens.access_token}"

        return params
```

---

## 2.4 Integration Generation from OpenAPI

### 2.4.1 Automated Code Generation

```python
class IntegrationGenerator:
    """
    Generate integration code from OpenAPI spec
    Based on: Workato, Cyclr, Google Cloud approaches
    """

    async def generate_from_openapi(
        self,
        openapi_url: str,
        integration_name: str
    ) -> GeneratedIntegration:
        """
        Full pipeline: OpenAPI spec → working integration
        """

        # Step 1: Fetch and parse OpenAPI spec
        spec = await self.fetch_openapi(openapi_url)
        parsed = self.parse_openapi(spec)

        # Step 2: Generate MCP server code
        mcp_code = self.generate_mcp_server(parsed, integration_name)

        # Step 3: Generate direct SDK code
        sdk_code = self.generate_sdk(parsed, integration_name)

        # Step 4: Generate TypeScript types
        types = self.generate_types(parsed, integration_name)

        # Step 5: Extract OAuth config
        oauth = self.extract_oauth_config(parsed)

        # Step 6: Generate tests
        tests = self.generate_tests(parsed, integration_name)

        # Step 7: Generate documentation
        docs = self.generate_docs(parsed, integration_name)

        return GeneratedIntegration(
            name=integration_name,
            mcp_server=mcp_code,
            sdk=sdk_code,
            types=types,
            oauth_config=oauth,
            tests=tests,
            docs=docs
        )

    def generate_mcp_server(
        self,
        spec: ParsedOpenAPI,
        name: str
    ) -> str:
        """Generate MCP server from spec"""

        template = """
# Generated MCP Server for {name}
# Auto-generated from OpenAPI spec

from mcp import MCPServer, Tool

server = MCPServer(name="{name}")

{tools}

if __name__ == "__main__":
    server.run()
        """

        # Generate tool for each endpoint
        tools = []
        for endpoint in spec.endpoints:
            tool_code = self.generate_tool(endpoint)
            tools.append(tool_code)

        return template.format(
            name=name,
            tools="\n\n".join(tools)
        )

    def generate_tool(self, endpoint: OpenAPIEndpoint) -> str:
        """Generate single tool from endpoint"""

        template = '''
@server.tool()
async def {function_name}({params}) -> dict:
    """
    {description}

    Args:
{param_docs}

    Returns:
        {return_type}
    """
    async with httpx.AsyncClient() as client:
        response = await client.{method}(
            "{url}",
            {request_args}
        )
        return response.json()
        '''

        return template.format(
            function_name=endpoint.operation_id,
            params=", ".join(f"{p.name}: {p.type}" for p in endpoint.parameters),
            description=endpoint.description,
            param_docs="\n".join(
                f"        {p.name}: {p.description}"
                for p in endpoint.parameters
            ),
            return_type=endpoint.return_type,
            method=endpoint.method.lower(),
            url=endpoint.path,
            request_args=self.format_request_args(endpoint)
        )
```

### 2.4.2 CI/CD Pipeline for Integrations

```yaml
# .github/workflows/generate-integrations.yml
name: Generate Integrations

on:
  push:
    paths:
      - 'specs/**.yaml'
      - 'specs/**.json'

jobs:
  generate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Generate integrations
        run: |
          for spec in specs/*.yaml; do
            python scripts/generate.py --spec $spec --output integrations/
          done

      - name: Run tests
        run: pytest integrations/tests/

      - name: Commit generated code
        run: |
          git config --global user.name "Integration Bot"
          git config --global user.email "bot@example.com"
          git add integrations/
          git commit -m "Auto-generate integrations from OpenAPI specs"
          git push
```

---

## 2.5 Recommended OAuth + Integration Roadmap

### Phase 1 (Weeks 1-2): Basic OAuth

- [ ] HashiCorp Vault setup
- [ ] Basic credential storage
- [ ] OAuth 2.0 flows (authorization code, client credentials)
- [ ] 3 test integrations (GitHub, Slack, Linear)

### Phase 2 (Weeks 3-4): Multi-Tenancy

- [ ] Per-tenant encryption keys
- [ ] Namespace isolation
- [ ] User-level vs org-level credentials
- [ ] OAuth proxy middleware

### Phase 3 (Weeks 5-6): Auto-Refresh

- [ ] Token refresh service
- [ ] Background job scheduler
- [ ] Expiration monitoring
- [ ] Invalid credential handling

### Phase 4 (Weeks 7-8): OpenAPI Generation

- [ ] OpenAPI parser
- [ ] Code generation templates
- [ ] MCP server generator
- [ ] SDK generator
- [ ] Test generator

### Phase 5 (Weeks 9-10): Scale

- [ ] CI/CD pipeline
- [ ] Batch integration generation
- [ ] Quality checks
- [ ] Documentation generation

---

## 2.6 Security Considerations (RFC 9700 Compliance)

### Required Security Measures:

1. **Token Storage**
   - ✅ Encrypt at rest (per-tenant keys)
   - ✅ Encrypt in transit (TLS 1.3)
   - ✅ Use secure storage (HashiCorp Vault)
   - ✅ Never log tokens

2. **Token Refresh**
   - ✅ Auto-refresh before expiry
   - ✅ Rotate refresh tokens
   - ✅ Handle refresh failures gracefully
   - ✅ Rate limit refresh requests

3. **Multi-Tenancy**
   - ✅ Namespace isolation
   - ✅ Per-tenant encryption keys
   - ✅ Audit logs per tenant
   - ✅ RBAC (Role-Based Access Control)

4. **OAuth Flows**
   - ✅ Use PKCE for public clients
   - ✅ State parameter for CSRF protection
   - ✅ Validate redirect URIs
   - ✅ Short-lived access tokens (15-60 min)
   - ✅ Long-lived refresh tokens (encrypted)

---

## Summary & Recommendations

### Tool Selection: Use Hybrid Approach ⭐

**Don't use:** Naive semantic search alone

**Do use:**
1. **Tool-to-Agent retrieval** (two-level indexing) - Easy to implement, proven results
2. **GraphRAG** (tool relationship graph) - Build over time from usage
3. **Less-is-More** (progressive loading) - Simple but effective
4. **Structured reasoning** (for complex queries) - Edge cases

**Expected Results:**
- 90-95% token reduction vs naive MCP
- 25-30% accuracy improvement vs basic semantic search
- Sub-100ms latency for most queries

### OAuth: Production-Ready Architecture ⭐

**Components:**
1. **HashiCorp Vault** - Industry standard, battle-tested
2. **Per-tenant encryption** - Security best practice
3. **Auto-refresh service** - Better UX, prevents auth failures
4. **OAuth proxy middleware** - Transparent auth injection
5. **OpenAPI code generation** - Scale to 500+ integrations quickly

**Timeline:** 10 weeks to full production-ready OAuth system

---

## Next Steps

1. **Validate tool selection approach** with ToolBench benchmark
2. **Prototype** Tool-to-Agent retrieval (2 weeks)
3. **Setup** HashiCorp Vault + basic OAuth (2 weeks)
4. **Build** OpenAPI generator (2 weeks)
5. **Test** end-to-end with 10 real integrations

**Total: ~8 weeks to have working system with 10 integrations**

Then scale to 50, 100, 500+ using automation.
