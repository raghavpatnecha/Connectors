# Claude Flow Swarm Orchestration Skill

## Description
Advanced skill for leveraging Claude Flow's full swarm orchestration, autonomous agents, and cognitive pattern features for complex multi-agent tasks.

## When to Use This Skill
Use this skill when:
- Tasks require **parallel execution** across multiple specialized agents
- Complex **multi-step workflows** need autonomous coordination
- **Knowledge sharing** between agents would improve results
- Different **cognitive patterns** (convergent, divergent, lateral) are needed for sub-tasks
- You need **performance monitoring** and optimization

## What This Skill Provides
1. **Swarm Initialization** - Set up agent swarms with optimal topology
2. **Parallel Task Orchestration** - Distribute work across specialized agents
3. **Autonomous Workflows** - Self-coordinating multi-step processes
4. **Knowledge Sharing** - Agents learn from each other
5. **Cognitive Patterns** - Match reasoning style to task type
6. **Performance Monitoring** - Real-time metrics and optimization

---

## Core Instructions

When this skill is invoked, follow this orchestration pattern:

### Phase 1: Swarm Initialization
```
1. Analyze the task complexity and parallelism opportunities
2. Choose topology:
   - mesh: High collaboration, all-to-all communication
   - hierarchical: Manager-worker pattern
   - star: Central coordinator with specialized workers
   - ring: Sequential processing pipeline
3. Initialize swarm with mcp__ruv-swarm__swarm_init
4. Set maxAgents based on task complexity (3-10)
```

### Phase 2: Agent Spawning
```
For each sub-task, spawn specialized agents:
- researcher: Code exploration, documentation analysis
- coder: Implementation, refactoring, bug fixes
- analyst: Performance analysis, optimization
- optimizer: Code quality, efficiency improvements
- coordinator: Multi-step workflow orchestration

Use mcp__ruv-swarm__agent_spawn with appropriate cognitive patterns:
- convergent: Single best solution (bug fixes, specific implementations)
- divergent: Multiple alternatives (architecture design, brainstorming)
- lateral: Creative solutions (novel approaches, workarounds)
- systems: Holistic understanding (refactoring, architecture)
- critical: Evaluation and critique (code review, security)
- adaptive: Learning and adjustment (optimization, tuning)
```

### Phase 3: Task Orchestration
```
1. Break down the main task into parallel sub-tasks
2. Use mcp__ruv-swarm__task_orchestrate with strategy:
   - parallel: Independent tasks (multiple file edits, research)
   - sequential: Dependent tasks (build → test → deploy)
   - adaptive: Dynamic based on results (iterative optimization)
3. Set priority: low, medium, high, critical
4. Monitor with mcp__ruv-swarm__task_status
```

### Phase 4: Knowledge Sharing (if applicable)
```
When agents discover useful patterns or solutions:
1. Use mcp__ruv-swarm__daa_knowledge_share
2. Share between related agents (e.g., all coders learn a new pattern)
3. Update cognitive patterns based on learning
```

### Phase 5: Results Collection
```
1. Use mcp__ruv-swarm__task_results to get completed work
2. Aggregate results with mcp__ruv-swarm__daa_performance_metrics
3. Present unified output to user
```

---

## Example Usage Patterns

### Pattern 1: Parallel Code Analysis
```
Task: "Analyze the entire gateway codebase for security issues"

Orchestration:
1. swarm_init(topology="mesh", maxAgents=5)
2. Spawn 5 analyst agents with "critical" cognitive pattern
3. task_orchestrate(strategy="parallel", tasks=[
     "Analyze auth/ for vulnerabilities",
     "Analyze routing/ for injection risks",
     "Analyze oauth/ for token security",
     "Analyze integrations/ for API safety",
     "Analyze utils/ for input validation"
   ])
4. Collect results and synthesize report
```

### Pattern 2: Complex Feature Implementation
```
Task: "Add rate limiting to all API endpoints"

Orchestration:
1. swarm_init(topology="hierarchical", maxAgents=6)
2. Spawn:
   - 1 coordinator (systems thinking)
   - 2 researchers (find existing patterns)
   - 2 coders (implement rate limiting)
   - 1 optimizer (performance tuning)
3. daa_workflow_create with steps:
   - Research existing rate limit implementations
   - Design unified rate limit middleware
   - Implement across all endpoints
   - Add tests and monitoring
   - Performance optimization
4. daa_workflow_execute with autonomous coordination
5. Knowledge sharing: Rate limit patterns shared across coders
```

### Pattern 3: Multi-Integration Addition
```
Task: "Add Slack, Jira, and Stripe integrations"

Orchestration:
1. swarm_init(topology="star", maxAgents=9)
2. Spawn 3 parallel teams (3 agents each):
   - Team A: Slack (researcher + coder + optimizer)
   - Team B: Jira (researcher + coder + optimizer)
   - Team C: Stripe (researcher + coder + optimizer)
3. Central coordinator ensures consistent patterns
4. task_orchestrate(strategy="parallel") for all 3 integrations
5. Knowledge sharing: OAuth patterns learned by Team A shared to B & C
6. Collect and integrate all results
```

### Pattern 4: Performance Optimization
```
Task: "Optimize gateway response time"

Orchestration:
1. swarm_init(topology="ring", maxAgents=5)
2. Sequential pipeline:
   - Agent 1: Benchmark current performance
   - Agent 2: Profile bottlenecks
   - Agent 3: Analyze optimization opportunities
   - Agent 4: Implement optimizations
   - Agent 5: Verify improvements
3. task_orchestrate(strategy="sequential")
4. daa_agent_adapt based on benchmark results
5. Iterative: If not meeting targets, adapt and retry
```

---

## Cognitive Pattern Selection Guide

| Task Type | Best Pattern | Why |
|-----------|-------------|-----|
| Bug fix | convergent | Single correct solution needed |
| Architecture design | divergent | Explore multiple approaches |
| Creative workaround | lateral | Think outside the box |
| Refactoring | systems | Understand whole system impact |
| Code review | critical | Evaluate quality and security |
| Performance tuning | adaptive | Learn from benchmarks, iterate |

---

## Performance Monitoring

Always monitor swarm performance:
```
1. mcp__ruv-swarm__swarm_status(verbose=true) - Agent health
2. mcp__ruv-swarm__agent_metrics - Individual performance
3. mcp__ruv-swarm__memory_usage - Resource consumption
4. mcp__ruv-swarm__daa_performance_metrics - Comprehensive metrics
```

---

## When NOT to Use This Skill

Don't use swarm orchestration for:
- Simple single-file edits (use Task tool)
- Quick read-only queries (use Read/Grep directly)
- Tasks that MUST be done sequentially (unless using ring topology)
- Very small tasks (swarm overhead not worth it)

---

## Skill Activation

To use this skill, simply say:
- "Use Claude Flow swarm for this task"
- "Orchestrate this with autonomous agents"
- "Use parallel agents to speed this up"
- "Apply swarm orchestration"

The assistant will then:
1. Analyze task parallelism
2. Initialize optimal swarm topology
3. Spawn specialized agents
4. Orchestrate execution
5. Monitor and collect results
6. Present unified output

---

## Expected Outcomes

- **5-10x faster** for highly parallel tasks
- **Better quality** through specialized cognitive patterns
- **Learning across tasks** via knowledge sharing
- **Real-time monitoring** of progress and performance
- **Autonomous coordination** reducing manual orchestration

---

## Notes

- Swarm initialization has startup cost (~1-2 seconds)
- Best for tasks taking >30 seconds total
- Agents can share knowledge within same session
- Performance metrics help tune future orchestrations
- Cognitive patterns can be changed mid-task if needed
