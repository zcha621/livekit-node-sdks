# MVVM Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                           MVVM ARCHITECTURE                                 │
│                         Agent Configuration                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  VIEW LAYER (Presentation)                                                  │
│  Files: src/pages/agent-config.tsx (81 lines)                              │
│         src/components/AgentConfigComponents.tsx (172 lines)                │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ AgentConfig Component                                                 │ │
│  │ ┌─────────────────────────────────────────────────────────────────┐   │ │
│  │ │ const vm = useAgentConfigViewModel();                           │   │ │
│  │ │                                                                  │   │ │
│  │ │ return (                                                         │   │ │
│  │ │   <div>                                                          │   │ │
│  │ │     <Navigation onLogout={vm.logout} />                          │   │ │
│  │ │     <AgentList agents={vm.agents} onSelect={vm.selectAgent} />  │   │ │
│  │ │     <CapabilityList capabilities={vm.capabilities} />            │   │ │
│  │ │     <ParameterPanel parameters={vm.parameters} />                │   │ │
│  │ │   </div>                                                         │   │ │
│  │ │ );                                                               │   │ │
│  │ └─────────────────────────────────────────────────────────────────┘   │ │
│  │                                                                         │ │
│  │  • No business logic                                                   │ │
│  │  • No API calls                                                        │ │
│  │  • Pure presentation                                                   │ │
│  │  • Component composition                                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ Uses ViewModel Hook
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  VIEWMODEL LAYER (Business Logic)                                           │
│  File: src/hooks/useAgentConfigViewModel.ts (202 lines)                    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ useAgentConfigViewModel Hook                                          │ │
│  │                                                                         │ │
│  │ State Management (9 useState hooks):                                   │ │
│  │ ├─ loading: boolean                                                    │ │
│  │ ├─ saving: boolean                                                     │ │
│  │ ├─ agents: Agent[]                                                     │ │
│  │ ├─ selectedAgent: Agent | null                                         │ │
│  │ ├─ capabilities: Capability[]                                          │ │
│  │ ├─ selectedCapability: Capability | null                               │ │
│  │ ├─ parameters: CapabilityParameter[]                                   │ │
│  │ ├─ message: string                                                     │ │
│  │ └─ messageType: 'success' | 'error'                                    │ │
│  │                                                                         │ │
│  │ Side Effects (1 useEffect):                                            │ │
│  │ ├─ Authentication check on mount                                       │ │
│  │ └─ Initial data loading                                                │ │
│  │                                                                         │ │
│  │ Public Actions (5 useCallback methods):                                │ │
│  │ ├─ selectAgent(agent)           → Load capabilities                    │ │
│  │ ├─ selectCapability(capability) → Load parameters                      │ │
│  │ ├─ updateParameter(index, value)→ Update state                         │ │
│  │ ├─ saveConfiguration()          → Save via service                     │ │
│  │ └─ logout()                     → Logout and redirect                  │ │
│  │                                                                         │ │
│  │ Private Helpers (4 functions):                                         │ │
│  │ ├─ loadAgents()                 → Fetch agents                         │ │
│  │ ├─ loadCapabilities(agentId)    → Fetch capabilities                   │ │
│  │ ├─ loadParameters(agentId, capId)→ Fetch parameters                    │ │
│  │ └─ showMessage(msg, type)       → Display feedback                     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ Calls Service Methods
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  MODEL LAYER (Data Access)                                                  │
│  File: src/services/agentService.ts (93 lines)                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ AgentService Class                                                    │ │
│  │                                                                         │ │
│  │ Data Interfaces:                                                        │ │
│  │ ├─ Agent                                                                │ │
│  │ │  ├─ agent_id: number                                                 │ │
│  │ │  ├─ agent_name: string                                               │ │
│  │ │  ├─ display_name: string                                             │ │
│  │ │  ├─ description: string                                              │ │
│  │ │  ├─ agent_type: string                                               │ │
│  │ │  └─ is_active: boolean                                               │ │
│  │ │                                                                       │ │
│  │ ├─ Capability                                                           │ │
│  │ │  ├─ capability_id: number                                            │ │
│  │ │  ├─ capability_name: string                                          │ │
│  │ │  ├─ interface_name: string                                           │ │
│  │ │  ├─ capability_category: string                                      │ │
│  │ │  ├─ is_enabled: boolean                                              │ │
│  │ │  └─ priority: number                                                 │ │
│  │ │                                                                       │ │
│  │ └─ CapabilityParameter                                                  │ │
│  │    ├─ parameter_key: string                                            │ │
│  │    ├─ parameter_value: string                                          │ │
│  │    ├─ parameter_type: string                                           │ │
│  │    ├─ description?: string                                             │ │
│  │    └─ config_source: string                                            │ │
│  │                                                                         │ │
│  │ Static Methods:                                                         │ │
│  │ ├─ getAgents()                          → Promise<Agent[]>             │ │
│  │ ├─ getCapabilities(agentId)             → Promise<Capability[]>        │ │
│  │ ├─ getParameters(agentId, capabilityId) → Promise<CapabilityParameter[]>│ │
│  │ └─ saveParameters(agentId, capabilityId, parameters) → Promise<void>   │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTP Requests (fetch)
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  BACKEND API                                                                 │
│                                                                             │
│  ├─ GET  /api/agents/list                                                  │
│  ├─ GET  /api/agents/:agentId/capabilities                                 │
│  ├─ GET  /api/agents/:agentId/:capabilityId/config                         │
│  ├─ PUT  /api/agents/:agentId/:capabilityId/config                         │
│  ├─ GET  /api/auth/user                                                    │
│  └─ POST /api/auth/logout                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  DATA FLOW EXAMPLE: User Selects Agent                                      │
│                                                                             │
│  1. User clicks agent in UI                                                 │
│     │                                                                        │
│     ▼                                                                        │
│  2. View calls vm.selectAgent(agent)                                        │
│     │                                                                        │
│     ▼                                                                        │
│  3. ViewModel updates state:                                                │
│     - setSelectedAgent(agent)                                               │
│     - setSelectedCapability(null)                                           │
│     - setParameters([])                                                     │
│     │                                                                        │
│     ▼                                                                        │
│  4. ViewModel calls loadCapabilities(agent.agent_id)                        │
│     │                                                                        │
│     ▼                                                                        │
│  5. ViewModel calls AgentService.getCapabilities(agentId)                   │
│     │                                                                        │
│     ▼                                                                        │
│  6. Model makes HTTP request: GET /api/agents/:agentId/capabilities         │
│     │                                                                        │
│     ▼                                                                        │
│  7. Model receives response and returns Capability[]                        │
│     │                                                                        │
│     ▼                                                                        │
│  8. ViewModel updates state: setCapabilities(data)                          │
│     │                                                                        │
│     ▼                                                                        │
│  9. View re-renders with new capabilities                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  BENEFITS SUMMARY                                                            │
│                                                                             │
│  ✅ Separation of Concerns                                                  │
│     - Data access, business logic, and UI are completely separated          │
│                                                                             │
│  ✅ Testability                                                             │
│     - Each layer can be tested independently with mocks                     │
│                                                                             │
│  ✅ Reusability                                                             │
│     - Services can be used anywhere                                         │
│     - ViewModels can power multiple views                                   │
│     - Components can be themed/restyled                                     │
│                                                                             │
│  ✅ Maintainability                                                         │
│     - Clear file structure                                                  │
│     - Single responsibility per file                                        │
│     - Easy to locate and modify code                                        │
│                                                                             │
│  ✅ Scalability                                                             │
│     - Pattern applies to all features                                       │
│     - Consistent codebase structure                                         │
│     - Easy onboarding for developers                                        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  CODE METRICS                                                                │
│                                                                             │
│  Before Refactoring:                                                         │
│  └─ agent-config.tsx: 307 lines (monolithic, mixed concerns)               │
│                                                                             │
│  After Refactoring:                                                          │
│  ├─ agentService.ts: 93 lines (Model)                                      │
│  ├─ useAgentConfigViewModel.ts: 202 lines (ViewModel)                      │
│  ├─ AgentConfigComponents.tsx: 172 lines (Reusable Components)             │
│  └─ agent-config.tsx: 81 lines (View)                                      │
│                                                                             │
│  Total: 548 lines in 4 focused files                                        │
│  Main Component Reduction: 73.6% (307 → 81 lines)                          │
│  Separation of Concerns: 100%                                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Organization

```
examples/webhooks-nextjs/
├── src/
│   ├── services/                    # MODEL LAYER
│   │   └── agentService.ts          # Data access & API calls
│   │
│   ├── hooks/                       # VIEWMODEL LAYER  
│   │   └── useAgentConfigViewModel.ts # Business logic & state
│   │
│   ├── components/                  # REUSABLE VIEW COMPONENTS
│   │   └── AgentConfigComponents.tsx # Presentational components
│   │
│   ├── pages/                       # PAGE-LEVEL VIEW COMPONENTS
│   │   └── agent-config.tsx         # Main page component
│   │
│   └── styles/                      # CSS MODULES
│       └── AgentConfig.module.css   # Scoped styles
│
└── docs/                            # DOCUMENTATION
    ├── MVVM-ARCHITECTURE.md         # Architecture guide
    ├── REFACTORING-SUMMARY.md       # Refactoring details
    └── MVVM-DIAGRAM.md              # This file
```

## Testing Pyramid

```
                    ┌─────────────┐
                    │     E2E     │ <- Full user flows
                    │    Tests    │    (Cypress/Playwright)
                    └─────────────┘
                  ┌───────────────────┐
                  │   Integration     │ <- Component + ViewModel
                  │      Tests        │    (React Testing Library)
                  └───────────────────┘
            ┌───────────────────────────────┐
            │        Unit Tests             │ <- Model + ViewModel + View
            │  (Jest + React Testing Lib)   │    (Isolated testing)
            └───────────────────────────────┘
```

## Key Principles

1. **One-Way Data Flow**: View → ViewModel → Model → Backend
2. **Clear Boundaries**: Each layer has specific responsibilities
3. **No Leaky Abstractions**: Layers communicate through interfaces
4. **Dependency Direction**: View depends on ViewModel, ViewModel depends on Model
5. **Immutable State**: State updates create new objects, not mutations
