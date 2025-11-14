# Claude Code Memory Usage Skill

## Overview
Claude Code provides two memory systems for persistent knowledge storage across sessions:

1. **ReasoningBank** (AI-powered) - Semantic search, embeddings, learning
2. **Basic Mode** (JSON) - Simple key-value storage

**Default:** AUTO mode (uses ReasoningBank if initialized, else JSON)

---

## When to Use Memory

Use memory to persist:
- **Project architecture decisions** - "Why did we choose unified GitHub server?"
- **Integration patterns** - "OAuth flow pattern for all integrations"
- **Common issues & solutions** - "How to fix rate limiting errors"
- **Tool locations** - "Where is the GitHub MCP server code?"
- **Coding standards** - "TypeScript naming conventions we use"
- **Performance benchmarks** - "Token reduction achieved: 99.02%"
- **Deployment configs** - "Production gateway URL and ports"

---

## Memory Commands

### Store Information
```bash
# Store in ReasoningBank (AI-powered, default)
npx claude-flow memory store <key> <value>

# Store in Basic mode (JSON only)
npx claude-flow memory store <key> <value> --basic

# Examples
npx claude-flow memory store "github-architecture" "Unified server with 29 tools replacing 44 fragmented servers"
npx claude-flow memory store "token-reduction" "99.02% reduction achieved through semantic routing"
npx claude-flow memory store "oauth-pattern" "Per-tenant OAuth via HashiCorp Vault with auto-refresh"
```

### Search/Query Memory
```bash
# Semantic search (ReasoningBank)
npx claude-flow memory query "github"
npx claude-flow memory query "oauth flow"
npx claude-flow memory query "how to add integration"

# List all memories
npx claude-flow memory list

# Show statistics
npx claude-flow memory stats
```

### Manage Memory
```bash
# Export memory
npx claude-flow memory export memory-backup.json

# Import memory
npx claude-flow memory import memory-backup.json

# Clear namespace
npx claude-flow memory clear --namespace "temp"

# Show current mode
npx claude-flow memory mode

# Check status
npx claude-flow memory status --reasoningbank
```

---

## ReasoningBank Features

**What makes ReasoningBank special:**
- 🧠 **Semantic search** - Find memories by meaning, not just keywords
- 📊 **Embeddings** - Uses local embeddings for similarity matching
- 🎯 **Confidence scores** - Returns relevance scores for each result
- 📚 **Trajectories** - Tracks learning paths and patterns
- 🔄 **Learning** - Gets better at retrieval over time

**Database location:** `.swarm/memory.db` (SQLite)

---

## Practical Usage Patterns

### Pattern 1: Store Project Decisions
```bash
# After making architectural decision
npx claude-flow memory store "why-unified-github" \
  "Replaced 44 fragmented servers with 1 unified server to reduce:
   - Containers: 97% (44→1)
   - Memory: 91% (2.2GB→200MB)
   - Complexity: Single OAuth flow, consistent architecture"

# Later retrieve
npx claude-flow memory query "why did we unify github"
# Returns the decision with context
```

### Pattern 2: Document Integration Patterns
```bash
# Store OAuth pattern
npx claude-flow memory store "oauth-implementation" \
  "All integrations use unified OAuth pattern:
   1. Gateway handles OAuth, not MCP servers
   2. Credentials stored in Vault with per-tenant encryption
   3. Auto-refresh 5min before expiry
   4. State format: tenantId:timestamp:random"

# Store integration checklist
npx claude-flow memory store "new-integration-checklist" \
  "When adding new integration:
   1. Create unified MCP server in /integrations/{category}/{name}-unified
   2. Use official SDK (not auto-generated)
   3. Add OAuth config to gateway/src/config/integrations.ts
   4. Update docker-compose.yml with service
   5. Add to README integrations list
   6. Commit with unified architecture pattern"
```

### Pattern 3: Common Issues & Solutions
```bash
# Store troubleshooting
npx claude-flow memory store "fix-docker-health-check" \
  "Docker health check fails in ES modules:
   Wrong: CMD node -e 'require(http)'
   Right: CMD wget --spider http://localhost:3000/health"

npx claude-flow memory store "typescript-return-types" \
  "Express routes need explicit return types:
   app.get('/path', async (req, res): Promise<void> => {
     if (error) {
       res.status(400).json({...});
       return; // Explicit return after response
     }
   })"

# Query when you hit the issue
npx claude-flow memory query "docker health check not working"
npx claude-flow memory query "typescript says not all code paths return"
```

### Pattern 4: Performance Metrics
```bash
npx claude-flow memory store "phase1-metrics" \
  "Phase 1 Completion Metrics:
   - Token reduction: 99.02% (target: 95%)
   - Tool selection latency: 1ms (target: <100ms)
   - Integrations: 4 operational (GitHub, Notion, LinkedIn, Reddit)
   - MCP servers: 4 unified (was 47 fragmented)
   - Test coverage: 89%"
```

### Pattern 5: Tool Locations (Fast Reference)
```bash
npx claude-flow memory store "gateway-location" "Gateway source: /home/user/Connectors/gateway/src"
npx claude-flow memory store "github-mcp" "GitHub unified: /home/user/Connectors/integrations/code/github-unified"
npx claude-flow memory store "oauth-code" "OAuth manager: gateway/src/auth/oauth-manager.ts"
npx claude-flow memory store "vault-client" "Vault integration: gateway/src/auth/vault-client.ts"

# Quick retrieval
npx claude-flow memory query "where is oauth code"
```

---

## Integration with Swarm/DAA

Memory can be shared across agents in swarm:

```bash
# Store learned patterns
npx claude-flow memory store "learned-oauth-pattern" \
  "After implementing 4 integrations, learned:
   - Always use state: tenantId:timestamp:random
   - Always add explicit return after res.send()
   - Always use ES modules (type: module)
   - Health checks: use wget, not node -e"

# Agents can query this during execution
# Use with daa_knowledge_share to propagate to all agents
```

---

## Namespaces (Organization)

Use namespaces to organize memories:

```bash
# Store with namespace
npx claude-flow memory store "oauth-flow" "..." --namespace "architecture"
npx claude-flow memory store "bug-fix-123" "..." --namespace "issues"
npx claude-flow memory store "deploy-prod" "..." --namespace "operations"

# Clear specific namespace
npx claude-flow memory clear --namespace "temp"
```

---

## Best Practices

1. **Be descriptive in keys** - Use clear, searchable names
2. **Include context in values** - Why, not just what
3. **Store decisions, not code** - Architecture, not implementation details
4. **Update when things change** - Keep memory current
5. **Use semantic queries** - Leverage ReasoningBank's AI search
6. **Export regularly** - Backup important knowledge
7. **Organize with namespaces** - Group related memories

---

## Example: Full Project Setup

```bash
# Store project context
npx claude-flow memory store "project-name" "Connectors - AI Agent Integration Platform"
npx claude-flow memory store "project-goal" "500+ integrations with 99% token reduction via semantic routing"
npx claude-flow memory store "tech-stack" "TypeScript (Gateway), Python (Scripts), Docker, Vault, Neo4j, FAISS"

# Store current status
npx claude-flow memory store "phase-status" "Phase 1 Complete - 4 integrations operational"
npx claude-flow memory store "next-focus" "Phase 2: Add more integrations (target 100+)"

# Store critical patterns
npx claude-flow memory store "architecture-principle" "Unified servers (not fragmented), official SDKs (not auto-gen)"
npx claude-flow memory store "oauth-principle" "Gateway handles OAuth, MCP servers are auth-agnostic"
npx claude-flow memory store "file-organization" "Never save to root, use: /integrations, /gateway, /docs"

# Query anytime
npx claude-flow memory query "what is this project"
npx claude-flow memory query "how should oauth work"
npx claude-flow memory query "where do files go"
```

---

## Skill Activation

When you need to store or retrieve project knowledge, say:
- "Store this in memory: [information]"
- "Remember that [decision/pattern]"
- "What does memory say about [topic]"
- "Query memory for [search terms]"

The assistant will use `npx claude-flow memory` commands to persist and retrieve knowledge across sessions.

---

## Storage Location

- **ReasoningBank DB:** `.swarm/memory.db` (SQLite with embeddings)
- **Basic JSON:** `./memory/memory-store.json`
- **Backups:** Export to any location with `memory export`

**Already gitignored:** `.swarm/` is in `.gitignore`, memory is local only

---

## Current Status

✅ ReasoningBank initialized and ready
✅ Auto mode enabled (uses ReasoningBank by default)
✅ 0 memories stored (clean slate)

**Next step:** Start storing project knowledge!
