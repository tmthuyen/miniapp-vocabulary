# Clean Architecture with Next.js Fullstack - Quick Start Guide

## Tóm tắt về Domain Entities và Relationships

### 1. **Domain Entities KHÔNG chứa Objects, chỉ chứa IDs**

```typescript
// ✅ ĐÚNG - Domain entity
class User {
  id: string;
  email: string;
  roleIds: string[];      // IDs only!
  addressIds: string[];   // IDs only!
}

// ❌ SAI - Domain entity
class User {
  id: string;
  email: string;
  roles: Role[];          // Objects - không được!
  addresses: Address[];   // Objects - không được!
}
```

**Lý do:**
- Domain entities không phụ thuộc vào database schema
- Dễ test: mock repositories đơn giản
- Flexible: có thể thay đổi storage, shard databases, etc.
- Immutable: IDs không thay đổi khi update related entities

---

## 2. **Repository Patterns - Multiple Load Methods**

### Pattern: Explicit Load Levels

```typescript
// Một repository CÓ THỂ có nhiều method:

interface UserRepository {
  // Level 1: Basic - KHÔNG load relations
  findById(id): User;
  
  // Level 2: + Roles
  findByIdWithRoles(id): { user: User; roles: Role[] };
  
  // Level 3: + Roles + Permissions
  findByIdWithPermissions(id): { 
    user: User; 
    roles: RoleWithPermissions[] 
  };
  
  // Level 4: Everything
  findByIdFull(id): UserFullProfile;
  
  // Custom: Select what you need
  findByIdWithProjection(id, {
    includeRoles?: boolean;
    includeAddresses?: boolean;
  });
}
```

**Lợi ích:**
- Tránh N+1 queries
- Tránh over-fetching (lấy data không cần)
- Clear intent: method name nói rõ sẽ load gì

---

## 3. **DTOs - Different Responses for Different Use Cases**

```typescript
// API needs different data levels:

// List endpoint: basic info only
UserResponseDTO {
  id, email, name, createdAt
}

// Admin panel: needs roles + permissions
UserWithRolesAndPermissionsDTO {
  id, email, name,
  roles: RoleWithPermissionsDTO[]
}

// Full profile: everything
UserFullProfileDTO {
  id, email, name,
  roles: RoleWithPermissionsDTO[],
  addresses: AddressDTO[],
  sessions: SessionDTO[]
}

// Mobile app: minimal data
UserProjectionDTO {
  id, email, name,
  roles?: RoleDTO[],
  addresses?: AddressDTO[]
}
```

**Mapping Strategy:**
```
User Entity + Roles + Permissions 
  ↓ UserMapper
UserWithRolesAndPermissionsDTO
  ↓ API Response
{ success: true, data: { ... } }
```

---

## 4. **How to Query with JOINs**

### Prisma with Explicit Include

```typescript
// Load user with roles
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    roles: {
      select: { id, name, description },
      include: {
        permissions: true // Nested
      }
    },
    addresses: true,
    sessions: {
      where: { expiresAt: { gt: new Date() } } // Only active
    }
  }
});
```

### Repository Implementation

```typescript
class PostgresUserRepository {
  // Different load levels
  
  async findById(id) {
    // NO relations
    return prisma.user.findUnique({ where: { id } });
  }
  
  async findByIdWithRoles(id) {
    // With roles
    const raw = await prisma.user.findUnique({
      where: { id },
      include: { roles: true }
    });
    
    return {
      user: this.toDomainEntity(raw),
      roles: raw.roles.map(r => new Role(...))
    };
  }
  
  async findByIdFull(id) {
    // Load all in parallel
    const [user, roles, addresses, sessions] = await Promise.all([
      this.loadUser(id),
      this.loadRoles(id),
      this.loadAddresses(id),
      this.loadSessions(id)
    ]);
    
    return { user, roles, addresses, sessions };
  }
}
```

---

## 5. **Load Strategy: Eager vs Lazy**

### Eager Loading (Load all at once)
```typescript
// Good for: API responses, SSR pages, batch operations
const user = await userRepository.findByIdFull(userId);
console.log(user.roles); // Already loaded

// Prisma: include: { roles: true }
```

### Lazy Loading (Load on demand)
```typescript
// Good for: background jobs, memory constraints
const user = await userRepository.findById(userId);
// ... do something with user ...
const roles = await userRepository.loadRoles(userId); // Load when needed

// Prisma: select without relations
```

### Batch Loading (DataLoader pattern)
```typescript
// Good for: GraphQL, multiple entities with same relations
const users = await Promise.all(
  userIds.map(id => userRepository.findById(id))
);
// DataLoader automatically batches: 100 queries → 1 query!
```

---

## 6. **Preventing N+1 Queries**

### ❌ BAD: N+1 Problem
```typescript
const users = await userRepository.findAll(); // 1 query
for (const user of users) {
  const roles = await roleRepository.findByIds(user.roleIds); // N queries!
}
```

### ✅ GOOD: Batch Load
```typescript
const users = await userRepository.findAllWithRoles(); // 1 query with JOIN

// Or manually batch
const users = await userRepository.findAll();
const allRoles = await roleRepository.findByIds(
  users.flatMap(u => u.roleIds)
); // 1 query!

// Map back to users
const rolesMap = new Map(allRoles.map(r => [r.id, r]));
const result = users.map(u => ({
  user: u,
  roles: u.roleIds.map(rid => rolesMap.get(rid))
}));
```

---

## 7. **Use Cases: Loading Data with Right Levels**

```typescript
// Use case có parameter để control load level:

class GetUserByIdUseCase {
  async execute(userId, loadLevel = 'basic') {
    const user = await userRepository.findById(userId);
    
    switch(loadLevel) {
      case 'basic':
        return UserMapper.toResponseDTO(user);
        
      case 'with_roles':
        const roles = await roleRepository.findByIds(user.roleIds);
        return UserMapper.toUserWithRolesDTO(user, roles);
        
      case 'full':
        const [roles, addresses, sessions] = await Promise.all([
          roleRepository.findByIds(user.roleIds),
          addressRepository.findByUserId(userId),
          sessionRepository.findByUserId(userId)
        ]);
        return UserMapper.toFullProfileDTO(user, roles, addresses, sessions);
    }
  }
}
```

### API Route Usage
```typescript
// GET /api/users/123                         → basic
// GET /api/users/123?loadLevel=with_roles    → with roles
// GET /api/users/123?loadLevel=full          → everything
// GET /api/users/123?projection=roles,permissions → custom fields

async function handler(req, res) {
  const loadLevel = req.query.loadLevel || 'basic';
  const user = await useCase.execute(userId, loadLevel);
  res.json({ success: true, data: user });
}
```

---

## 8. **Caching Strategy**

### Simple Cache
```typescript
const cacheKey = `user:${userId}`;

// Check cache first
let user = await cache.get(cacheKey);

if (!user) {
  // Cache miss: load from DB
  user = await userRepository.findById(userId);
  
  // Store in cache
  await cache.set(cacheKey, user, 3600); // 1 hour TTL
}
```

### Cache Invalidation
```typescript
// When user updates
await userRepository.update(user);

// Invalidate cache
await cache.delete(`user:${user.id}`);
await cache.delete(`user:email:${user.email}`);
await cache.delete(`users:all:*`); // Pattern delete
```

### Using Decorator Pattern
```typescript
class CachedUserRepository implements IUserRepository {
  constructor(
    private innerRepository: IUserRepository,
    private cache: ICacheService
  ) {}
  
  async findById(id) {
    const cached = await this.cache.get(`user:${id}`);
    if (cached) return cached;
    
    const user = await this.innerRepository.findById(id);
    if (user) await this.cache.set(`user:${id}`, user);
    return user;
  }
}
```

---

## 9. **File Structure Summary**

```
src/
├── domain/
│   ├── entities/          # User, Role, Permission, Address
│   ├── repositories/      # IUserRepository, IRoleRepository (interfaces)
│   └── services/          # Domain business logic
│
├── application/
│   ├── dtos/             # UserResponseDTO, UserWithRolesDTO, etc
│   ├── usecases/         # GetUserByIdUseCase, ListUsersUseCase
│   ├── mappers/          # UserMapper (Entity ↔ DTO)
│   └── interfaces/       # IEmailService, IQueueService, IEventBus
│
├── infrastructure/
│   ├── database/
│   │   └── repositories/ # PostgresUserRepository (implementations)
│   ├── email/            # SendgridEmailService, ResendEmailService
│   ├── queue/            # RedisQueueService, RabbitMQQueueService
│   ├── socket/           # SocketIOService
│   └── cache/            # RedisCache, InMemoryCache
│
├── presentation/
│   ├── pages/api/        # API routes
│   ├── components/       # React components
│   ├── controllers/      # Request handlers (optional)
│   └── middleware/       # Auth, error handling
│
├── di/                   # Container, dependency injection
└── config/               # Environment config

tests/
├── unit/                 # Domain + Application logic tests
├── integration/          # With real DB but mocked external services
└── e2e/                  # Full flow tests
```

---

## 10. **Quick Decision Tree**

```
"I need to load a user"
├─ "Just basic info?" → findById()
├─ "With roles?" → findByIdWithRoles()
├─ "With roles + permissions?" → findByIdWithPermissions()
├─ "Everything?" → findByIdFull()
└─ "Just specific fields?" → findByIdWithProjection({...})
   
"User is loaded, now map to DTO"
├─ "Just user info?" → UserMapper.toResponseDTO()
├─ "User + roles?" → UserMapper.toUserWithRolesDTO()
├─ "Deep nested?" → UserMapper.toFullProfileDTO()
└─ "Custom fields?" → UserMapper.toProjectionDTO()

"Multiple users?"
├─ "N users with roles?" 
│  ├─ "Load separately?" → Promise.all() + batch load
│  └─ "Load with JOIN?" → findAllWithRoles()
└─ "Specific permission?" → findByPermission()

"Want to avoid N+1?"
├─ "Use JOIN in database" → include: { roles: true }
├─ "Batch load IDs" → findByIds([id1, id2, ...])
└─ "Use DataLoader" → Automatic batching
```

---

## 11. **Testing Approach**

```typescript
describe('GetUserWithRolesUseCase', () => {
  // 1. Mock repositories
  const mockUserRepo = { findById: jest.fn() };
  const mockRoleRepo = { findByIds: jest.fn() };
  
  // 2. Create use case with mocks
  const useCase = new GetUserWithRolesUseCase(
    mockUserRepo,
    mockRoleRepo
  );
  
  // 3. Setup mock data
  mockUserRepo.findById.mockResolvedValue(
    new User('123', 'test@example.com', 'Test', 'pass', [], ['role-1'])
  );
  
  mockRoleRepo.findByIds.mockResolvedValue([
    new Role('role-1', 'admin', 'Administrator')
  ]);
  
  // 4. Execute and assert
  const result = await useCase.execute('123');
  expect(result.user.id).toBe('123');
  expect(result.roles).toHaveLength(1);
});
```

---

## 12. **Common Mistakes to Avoid**

### ❌ Mistake 1: Entities with Objects
```typescript
// BAD
class User {
  roles: Role[]; // Don't do this!
}
```

### ❌ Mistake 2: Over-fetching Everything
```typescript
// BAD - always load everything
async findById(id) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      roles: { include: { permissions: true } },
      addresses: true,
      sessions: true,
      // ... 10 more relations ...
    }
  });
}
```

### ❌ Mistake 3: Passing DTOs Between Layers
```typescript
// BAD
class UserRepository {
  async findById(id): UserResponseDTO { // Return DTO!
    // ...
  }
}

// GOOD
class UserRepository {
  async findById(id): User { // Return Entity!
    // ...
  }
}
// Then map to DTO in use case/API
```

### ❌ Mistake 4: N+1 Queries
```typescript
// BAD
const users = await userRepository.findAll();
for (const user of users) {
  user.roles = await roleRepository.findByIds(user.roleIds); // N queries!
}
```

---

## 13. **Real World Example Flow**

```
User requests: GET /api/users/user-123?loadLevel=with_permissions

  ↓
  
API Route catches request
  ↓
Calls GetUserByIdUseCase.execute(userId, 'with_permissions')
  ↓
Use case:
  1. user = userRepository.findById(userId)
  2. roles = roleRepository.findByIds(user.roleIds)
  3. permissions = load for each role in parallel
  ↓
Maps to DTO:
  UserWithRolesAndPermissionsDTO
  ↓
Returns to API route:
  { success: true, data: { id, email, roles: [...] } }
  ↓
JSON response sent to client
```

---

## 14. **Performance Checklist**

- [ ] Are you loading what you need? (No over-fetch)
- [ ] Using JOINs for multiple entities? (No N+1)
- [ ] Caching frequently accessed data?
- [ ] Batching queries when loading multiple entities?
- [ ] Using selective fields with `select` in Prisma?
- [ ] Handling filtering efficiently (WHERE clause, not in code)?
- [ ] Pagination implemented for list endpoints?
- [ ] Monitoring query performance?

---

## 15. **Key Takeaways**

1. **Domain entities store IDs, not objects**
2. **Repository has multiple load methods for different needs**
3. **DTOs are use-case specific, not one-size-fits-all**
4. **Mappers bridge entities and DTOs**
5. **Load relationships deliberately, not automatically**
6. **Prevent N+1 with JOINs or batch loading**
7. **Cache strategically, invalidate granularly**
8. **Test layers independently with mocks**
9. **Keep infrastructure implementations swappable**
10. **Profile and optimize based on real bottlenecks**

---

## Files in This Package

1. **clean-architecture-nextjs-structure.txt** - Project folder structure
2. **01_User.ts** - Basic domain entity
3. **02_IUserRepository.ts** - Repository interface
4. **03_DTOs.ts** - Data transfer objects
5. **04_CreateUserUseCase.ts** - Use case example
6. **05_PostgresUserRepository.ts** - Repository implementation
7. **06_ServiceInterfaces.ts** - Service abstractions (Email, Queue, etc)
8. **07_EmailServices.ts** - Multiple email implementations
9. **08_EventBus.ts** - Event handling
10. **09_QueueServices.ts** - Job queues
11. **10_SocketService.ts** - WebSocket handling
12. **11_DIContainer.ts** - Dependency injection
13. **12_APIRoutes.ts** - Next.js API routes
14. **13_Tests.ts** - Testing examples
15. **14_ConfigAndFactory.ts** - Configuration management
16. **15_DomainEntitiesWithRelationships.ts** - Multiple related entities
17. **16_RelationshipRepositories.ts** - Repository interfaces for relationships
18. **17_RelationshipDTOs.ts** - DTOs for different load levels
19. **18_Mappers.ts** - Entity to DTO mapping
20. **19_RepositoryWithJoins.ts** - Repository with JOINs and multiple load methods
21. **20_UseCasesWithDifferentLoads.ts** - Use cases with flexible loading
22. **21_APIRoutesWithDifferentDTOs.ts** - API endpoints with different response types
23. **22_CachingAndOptimization.ts** - Caching strategies
24. **23_PrismaSchema.prisma** - Database schema
25. **24_RelationshipsBestPractices.ts** - Best practices guide
26. **00_QUICK_START.md** - This file

---

Start with reading this file, then explore other files in order!
