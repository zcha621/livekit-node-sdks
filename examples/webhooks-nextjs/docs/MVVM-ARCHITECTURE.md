# MVVM Architecture Guide

## Overview

This project follows the **MVVM (Model-View-ViewModel)** architectural pattern for frontend components, ensuring clear separation of concerns and improved maintainability.

## Architecture Layers

### 1. Model Layer (`src/services/`)

**Purpose**: Encapsulates all data access and API interactions

**Characteristics**:
- Pure TypeScript classes with static methods
- No React dependencies
- Handles HTTP requests and data transformations
- Defines TypeScript interfaces for data structures
- Throws descriptive errors on failures

**Example**: `agentService.ts`

```typescript
export class AgentService {
  static async getAgents(): Promise<Agent[]> {
    const response = await fetch('/api/agents/list');
    if (!response.ok) throw new Error('Failed to fetch agents');
    return response.json();
  }
}
```

### 2. ViewModel Layer (`src/hooks/`)

**Purpose**: Manages state and orchestrates business logic

**Characteristics**:
- Custom React hooks
- Uses useState, useEffect, useCallback
- No direct JSX/UI code
- Calls Model layer for data
- Provides interface for View layer
- Handles authentication, navigation, side effects

**Example**: `useAgentConfigViewModel.ts`

```typescript
export function useAgentConfigViewModel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const selectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent);
    loadCapabilities(agent.agent_id);
  }, []);
  
  return {
    agents,
    loading,
    selectAgent,
    // ... other state and actions
  };
}
```

### 3. View Layer (`src/pages/`, `src/components/`)

**Purpose**: Pure presentational components

**Characteristics**:
- No business logic
- No API calls
- No complex state management
- Only renders based on props/ViewModel
- Handles user interactions by calling ViewModel methods

**Example**: `agent-config.tsx`

```typescript
export default function AgentConfig() {
  const vm = useAgentConfigViewModel();
  
  return (
    <div>
      <AgentList 
        agents={vm.agents}
        onSelectAgent={vm.selectAgent}
      />
    </div>
  );
}
```

## Benefits

### Testability
- **Model**: Unit test with mocked fetch
- **ViewModel**: Unit test with React Testing Library
- **View**: Shallow render tests with mocked ViewModel

### Reusability
- **Model**: Services can be used anywhere
- **ViewModel**: Hooks can power multiple components
- **View**: Components can be themed/styled differently

### Maintainability
- Clear responsibilities
- Easy to locate code
- Single source of truth

### Scalability
- Pattern applies to all features
- Consistent codebase structure
- Easy onboarding for new developers

## File Structure

```
src/
├── services/           # Model Layer
│   ├── agentService.ts
│   ├── authService.ts
│   └── ...
├── hooks/             # ViewModel Layer
│   ├── useAgentConfigViewModel.ts
│   ├── useAdminUsersViewModel.ts
│   └── ...
├── components/        # Reusable View Components
│   ├── AgentConfigComponents.tsx
│   └── ...
├── pages/            # Page-level View Components
│   ├── agent-config.tsx
│   ├── admin-users.tsx
│   └── ...
└── styles/           # CSS Modules
    ├── AgentConfig.module.css
    └── ...
```

## Development Guidelines

### When creating a new feature:

1. **Define Data Structures** (Model)
   - Create TypeScript interfaces
   - Implement service class with static methods
   - Add error handling

2. **Implement Business Logic** (ViewModel)
   - Create custom hook
   - Add state with useState
   - Add side effects with useEffect
   - Memoize callbacks with useCallback
   - Return interface with state and actions

3. **Build UI** (View)
   - Create presentational components
   - Accept props for all data
   - Call callbacks for user interactions
   - No business logic in JSX

### Best Practices

#### Model Layer
- ✅ Use descriptive error messages
- ✅ Type all parameters and returns
- ✅ Keep methods stateless
- ❌ Don't import React hooks
- ❌ Don't handle UI concerns

#### ViewModel Layer
- ✅ Use useCallback for methods passed to components
- ✅ Clean up side effects in useEffect
- ✅ Provide clear interface
- ❌ Don't manipulate DOM
- ❌ Don't include JSX

#### View Layer
- ✅ Keep components small and focused
- ✅ Extract reusable sub-components
- ✅ Use CSS modules for styling
- ❌ Don't fetch data directly
- ❌ Don't implement complex logic

## Migration Status

### Completed MVVM Refactoring
- ✅ `agent-config.tsx` - Full MVVM implementation
  - Model: `agentService.ts`
  - ViewModel: `useAgentConfigViewModel.ts`
  - View: `agent-config.tsx` + `AgentConfigComponents.tsx`

### Pending Refactoring
- ⏳ `admin-users.tsx`
- ⏳ `change-password.tsx`
- ⏳ `livekit-admin.tsx`
- ⏳ `agent-builder.tsx`

## Testing Strategy

### Model Layer Tests
```typescript
describe('AgentService', () => {
  it('should fetch agents', async () => {
    global.fetch = jest.fn(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );
    const agents = await AgentService.getAgents();
    expect(agents).toEqual([]);
  });
});
```

### ViewModel Tests
```typescript
describe('useAgentConfigViewModel', () => {
  it('should load agents on mount', async () => {
    const { result } = renderHook(() => useAgentConfigViewModel());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.agents.length).toBeGreaterThan(0);
  });
});
```

### View Tests
```typescript
describe('AgentConfig', () => {
  it('should render agent list', () => {
    const mockViewModel = { agents: [{ id: 1, name: 'Test' }], ... };
    jest.mock('../hooks/useAgentConfigViewModel', () => mockViewModel);
    const { getByText } = render(<AgentConfig />);
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```

## Resources

- [React Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [MVVM Pattern](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Contributing

When adding new features, please follow the MVVM pattern:
1. Create service in `src/services/`
2. Create ViewModel hook in `src/hooks/`
3. Create/update view component
4. Add unit tests for each layer
5. Update this documentation

## Questions?

If you have questions about the architecture or need help implementing MVVM for a new feature, please refer to the `agent-config` implementation as a reference example.
