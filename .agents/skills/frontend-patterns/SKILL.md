---
name: frontend-patterns
description: Frontend development patterns for React, Angular, state management, performance optimization, and UI best practices.
---

# Frontend Development Patterns

Comprehensive frontend development skill for OpenCode — covers React components, Angular components, state management, custom hooks, forms, performance optimization, and accessibility. Triggered when the user mentions frontend patterns, React/Angular components, state management, or UI optimization.

## Table of Contents
1. [When to Trigger](#when-to-trigger)
2. [Component Patterns](#component-patterns)
3. [Custom Hooks](#custom-hooks-react)
4. [Angular Services](#angular-services)
5. [State Management](#state-management)
6. [Performance](#performance)
7. [Form Handling](#form-handling)
8. [Accessibility](#accessibility)
9. [Checklists](#checklists)
10. [OpenCode Usage Examples](#opencode-usage-examples)

---

## When to Trigger

Activate this skill when user input contains:
- **Keywords**: React, Angular, component, hook, useState, useReducer, Redux, NgRx, Context, memoization, lazy loading, forms, validation, accessibility, UI, frontend
- **Contexts**: Building components, managing state, data fetching, performance optimization, form handling, building accessible/responsive UI
- **Frameworks**: React, Angular, Next.js, NgRx, React Query, SWR, Zod, react-hook-form

---

## Component Patterns

### React - Composition Over Inheritance

```typescript
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}
```

### React - Compound Components

```typescript
const TabsContext = createContext<{ activeTab: string; setActiveTab: (t: string) => void } | undefined>(undefined)

export function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return <TabsContext.Provider value={{ activeTab, setActiveTab }}>{children}</TabsContext.Provider>
}
```

### Angular - Component Structure

```typescript
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  standalone: true,
  imports: [CommonModule, UserCardComponent]
})
export class UserListComponent implements OnInit {
  @Input() users: User[] = []
  @Output() userSelected = new EventEmitter<User>()

  ngOnInit() {}
}
```

## Custom Hooks (React)

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
```

## Angular Services

```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users')
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`)
  }
}
```

## State Management

### React - Context + Reducer

```typescript
const MarketContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(undefined)

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return <MarketContext.Provider value={{ state, dispatch }}>{children}</MarketContext.Provider>
}
```

### Angular - NgRx SignalStore

```typescript
export const UserStore = signalStore(
  withState({ users: [] as User[], loading: false }),
  withMethods((store, userService = inject(UserService)) => ({
    loadUsers: rxMethod<void>(pipe(
      tap(() => patchState(store, { loading: true })),
      switchMap(() => userService.getUsers().pipe(
        tap(users => patchState(store, { users, loading: false }))
      ))
    }))
  }))
)
```

## Performance

### React - Memoization

```typescript
const sortedMarkets = useMemo(() => {
  return markets.sort((a, b) => b.volume - a.volume)
}, [markets])

const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

export const MarketCard = React.memo<MarketCardProps>(({ market }) => {
  return <div className="market-card">{market.name}</div>
})
```

### Lazy Loading

```typescript
const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  )
}
```

## Form Handling

### React with Zod

```typescript
const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
})

export function CreateForm() {
  const form = useForm({ resolver: zodResolver(schema) })
  const onSubmit = form.handleSubmit((data) => console.log(data))
}
```

### Angular Reactive Forms

```typescript
export class UserFormComponent implements OnInit {
  form!: FormGroup

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email]]
    })
  }
}
```

## Accessibility

```typescript
<div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox">
  <button onClick={() => setIsOpen(!isOpen)} aria-label="Open dropdown">
    {selectedOption}
  </button>
</div>
```

---

## Checklists

### Component Development
- [ ] Use composition over inheritance
- [ ] Implement compound components for complex UI
- [ ] Keep components small and focused
- [ ] Use standalone components in Angular
- [ ] Add proper TypeScript types for all props

### State Management
- [ ] Choose appropriate state solution (local vs global)
- [ ] Use Context + useReducer for mid-complexity state
- [ ] Use NgRx SignalStore for Angular global state
- [ ] Avoid unnecessary re-renders with memoization

### Performance
- [ ] Apply `useMemo` for expensive computations
- [ ] Use `useCallback` for stable handler references
- [ ] Use `React.memo` for pure components
- [ ] Implement lazy loading with `Suspense`
- [ ] Virtualize long lists

### Forms
- [ ] Use Zod or class-validator for schema validation
- [ ] Implement controlled components
- [ ] Provide clear validation error messages
- [ ] Handle form submission states (loading, error, success)

### Accessibility
- [ ] Add `aria-*` attributes for interactive elements
- [ ] Use semantic HTML elements
- [ ] Ensure keyboard navigation support
- [ ] Provide visible focus indicators
- [ ] Test with screen readers

---

## OpenCode Usage Examples

```
Create a React component for a user card with composition pattern
```

```
Write an Angular service for fetching paginated users with proper DI
```

```
Build a custom useDebounce hook for a search input
```

```
Refactor this class component to use hooks and Context for state
```

```
Add lazy loading and Suspense boundaries to this dashboard route
```

```
Create a form with Zod validation and react-hook-form
```

```
Optimize this list rendering with memoization and virtualization
```

---

*Following Agent Skills specification for progressive disclosure and best practices.*

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.