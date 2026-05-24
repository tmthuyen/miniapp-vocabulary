# Clean Architecture with Next.js Fullstack - Complete Guide

## 📚 Overview

Đây là hướng dẫn chi tiết về cách tổ chức Next.js fullstack project theo Clean Architecture, đặc biệt tập trung vào:

1. **Cách xử lý relationships** giữa các bảng (User → Roles → Permissions)
2. **Multiple load levels** - Load đúng dữ liệu cần thiết
3. **DTOs cho mỗi use case** - Không one-size-fits-all response
4. **Flexible infrastructure** - Thay đổi database, email service, queue dễ dàng

## 🎯 Tại Sao Clean Architecture?

### Vấn đề với cách cũ:
```typescript
// ❌ Monolithic - tất cả trong model
async function getUser(id) {
  return db.user.findOne(id).populate('roles').populate('permissions');
  // Lúc nào cũng load TẤT CẢ - over-fetch!
}

// API response quá lớn, có data không cần
// Khó thay đổi database
// Khó test
```

### Giải pháp Clean Architecture:
```typescript
// ✅ Layered - tách biệt responsibilities
async function getUser(id, loadLevel) {
  const user = await userRepository.findById(id); // Basic
  
  if (loadLevel === 'with_roles') {
    const roles = await roleRepository.findByIds(user.roleIds);
    return UserMapper.toWithRolesDTO(user, roles);
  }
  // Có thể load thêm, hoặc không - tuỳ vào use case!
}
```

## 📖 File Descriptions & Reading Order

### Start Here (15 minutes)
- **00_QUICK_START.md** - Overview, decision tree, quick reference
- **clean-architecture-nextjs-structure.txt** - Folder structure

### Part 1: Core Concepts (30 minutes)
- **01_User.ts** - Basic domain entity (không có relationships)
- **02_IUserRepository.ts** - Repository interface abstraction
- **03_DTOs.ts** - Data Transfer Objects intro
- **04_CreateUserUseCase.ts** - Use case orchestrating domain + repos
- **05_PostgresUserRepository.ts** - First implementation

### Part 2: Infrastructure & Services (30 minutes)
- **06_ServiceInterfaces.ts** - Email, Queue, Events, Socket abstractions
- **07_EmailServices.ts** - Multiple email implementations (Sendgrid, Resend, Mock)
- **08_EventBus.ts** - Event emitter with subscribers
- **09_QueueServices.ts** - Job queue implementations (Redis, RabbitMQ)
- **10_SocketService.ts** - WebSocket service
- **11_DIContainer.ts** - Dependency Injection container

### Part 3: Presentation Layer (20 minutes)
- **12_APIRoutes.ts** - Next.js API routes
- **13_Tests.ts** - Testing patterns (unit + integration)
- **14_ConfigAndFactory.ts** - Configuration and swappable implementations

### Part 4: RELATIONSHIPS (45 minutes - Most Important!)
- **15_DomainEntitiesWithRelationships.ts** - **KEY**: Entities with only IDs
- **16_RelationshipRepositories.ts** - Repository interfaces for multiple entities
- **17_RelationshipDTOs.ts** - Different DTOs for different load levels
- **18_Mappers.ts** - Converting entities to DTOs
- **19_RepositoryWithJoins.ts** - **KEY**: Multiple load methods, JOIN queries
- **20_UseCasesWithDifferentLoads.ts** - Use cases with flexible loading
- **21_APIRoutesWithDifferentDTOs.ts** - API endpoints with projection
- **22_CachingAndOptimization.ts** - Caching strategies, N+1 prevention

### Reference & Best Practices (20 minutes)
- **23_PrismaSchema.prisma** - Database schema example
- **24_RelationshipsBestPractices.ts** - Patterns and anti-patterns
- **25_DataFlowDiagrams.ts** - Visual data flow, transformation examples

---

## 🔑 Core Concepts Explained

### 1. Domain Entities - IDs Only, No Objects

```typescript
// ✅ CORRECT
class User {
  id: string;
  email: string;
  roleIds: string[];        // Just IDs!
  addressIds: string[];     // Just IDs!
}

// ❌ WRONG
class User {
  id: string;
  email: string;
  roles: Role[];            // DON'T do this!
  addresses: Address[];     // DON'T do this!
}
```

**Why?**
- Independent from DB schema
- Easy to test (mock repos)
- Flexible (can shard, split DB, etc)
- Immutable at domain level

### 2. Repository Pattern - Multiple Load Methods

```typescript
interface UserRepository {
  // Level 0: Just user
  findById(id): User;
  
  // Level 1: User + roles
  findByIdWithRoles(id): { user: User; roles: Role[] };
  
  // Level 2: User + roles + permissions
  findByIdWithPermissions(id): { user: User; roles: RoleWithPerms[] };
  
  // Level 3: Everything
  findByIdFull(id): UserFullProfile;
  
  // Custom: Select specific fields
  findByIdWithProjection(id, { includeRoles, includeAddresses });
}
```

**Benefits:**
- No N+1 queries (use JOINs in findByIdWithRoles)
- No over-fetch (load only what you need)
- Clear intent (method name says what loads)

### 3. DTOs - Use-Case Specific, Not Generic

```typescript
// List endpoint
UserResponseDTO { id, email, name }

// Admin dashboard
UserWithRolesDTO { id, email, name, roles: [] }

// Full profile
UserFullProfileDTO { id, email, roles: [], addresses: [], sessions: [] }

// Mobile app (minimal)
UserProjectionDTO { id, email, name, roles?: [] }
```

### 4. Mappers - Bridge Between Entities and DTOs

```
User Entity (domain)
  ↓
UserMapper.toResponseDTO()
  ↓
UserResponseDTO (presentation)
  ↓
API Response JSON
```

### 5. Use Cases - Orchestrate Everything

```typescript
class GetUserByIdUseCase {
  async execute(userId, loadLevel) {
    const user = await userRepository.findById(userId);
    
    switch(loadLevel) {
      case 'basic':
        return UserMapper.toResponseDTO(user);
      case 'with_roles':
        const roles = await roleRepository.findByIds(user.roleIds);
        return UserMapper.toUserWithRolesDTO(user, roles);
      case 'full':
        const [roles, addresses, sessions] = await Promise.all([...]);
        return UserMapper.toFullProfileDTO(user, roles, addresses, sessions);
    }
  }
}
```

---

## 🏗️ Architecture Layers Explained

### Layer 1: Domain
- **No Framework**
- Pure business logic
- Entities with validation rules
- Repository interfaces (abstractions, no implementation)

### Layer 2: Application
- **No Database**
- Use cases orchestrating domain + services
- DTOs for IO
- Mappers between entities and DTOs

### Layer 3: Infrastructure
- **Implementations**
- Repository implementations (Prisma, MongoDB, etc)
- Service implementations (Sendgrid, Resend, etc)
- Event handlers
- Queue workers

### Layer 4: Presentation
- **Next.js Specific**
- API routes
- React components
- Middleware

### Dependency Flow: Outer → Inner (Only!)
```
Presentation
    ↓
Application
    ↓
Domain (doesn't depend on anything)
    ↓
Infrastructure (but injected in, not imported)
```

---

## 🔄 Data Flow Example

```
Request: GET /api/users/123?loadLevel=with_permissions

1. Presentation
   API Route catches request
   ↓
2. Application
   GetUserByIdUseCase.execute(123, 'with_permissions')
   ├─ userRepository.findById(123)           → User entity
   ├─ roleRepository.findByIds(user.roleIds) → Role[] entities
   ├─ permissionRepository.findByIds(...)    → Permission[] entities
   ↓
3. Infrastructure
   PostgreSQL queries with JOINs
   ├─ SELECT * FROM user WHERE id = '123'
   ├─ SELECT * FROM role WHERE id IN (...)
   └─ SELECT * FROM permission WHERE id IN (...)
   ↓
4. Mapping (Application)
   UserMapper.toUserWithPermissionsDTO()
   ↓
5. API Response (Presentation)
   { success: true, data: UserWithRolesAndPermissionsDTO }
```

---

## 💡 Key Patterns

### Pattern 1: Multiple Repository Methods
```typescript
// Same data, different load levels
userRepository.findById(id)                    // 1 query
userRepository.findByIdWithRoles(id)           // 1 query + JOIN
userRepository.findByIdWithPermissions(id)     // 2 queries + nested JOINs
userRepository.findByIdFull(id)                // 3-4 queries
```

### Pattern 2: Batch Loading (No N+1)
```typescript
// ❌ BAD
for (const user of users) {
  const roles = await roleRepo.findByIds(user.roleIds); // N queries!
}

// ✅ GOOD
const allRoleIds = users.flatMap(u => u.roleIds);
const allRoles = await roleRepo.findByIds(allRoleIds); // 1 query!
const roleMap = new Map(allRoles.map(r => [r.id, r]));
const result = users.map(u => ({
  user: u,
  roles: u.roleIds.map(rid => roleMap.get(rid))
}));
```

### Pattern 3: Service Abstraction (Swappable)
```typescript
// Define interface
interface IEmailService {
  sendWelcomeEmail(email, name): Promise<void>;
}

// Multiple implementations
class SendgridEmailService implements IEmailService { ... }
class ResendEmailService implements IEmailService { ... }
class MockEmailService implements IEmailService { ... } // for tests

// Choose at container setup
if (isProduction) {
  container.register('IEmailService', new SendgridEmailService(...));
} else if (isTest) {
  container.register('IEmailService', new MockEmailService());
}
```

### Pattern 4: Event-Driven Architecture
```typescript
// Domain logic emits event
await eventBus.emit({
  type: 'USER_CREATED',
  payload: { userId, email, name }
});

// Different subscribers react independently
// - Send welcome email (in queue)
// - Notify admins (via socket)
// - Log analytics
// - Sync with third-party
```

---

## 📊 Load Levels Comparison

| Load Level | SQL Queries | Relations | Use Case | Response Size |
|-----------|-----------|-----------|----------|--------------|
| BASIC | 1 | None | List view, minimal | Small |
| WITH_ROLES | 1 JOIN | User→Roles | Dashboard | Medium |
| WITH_PERMISSIONS | 2 JOINs | User→Roles→Perms | Admin panel | Large |
| FULL | 3+ JOINs | User→Roles→Perms, Addresses, Sessions | Full profile | Very Large |
| CUSTOM | 1-3 | Selected only | Mobile, specific API | Minimal |

---

## 🚀 Getting Started

### 1. Setup Project
```bash
npm create next-app@latest my-app -- --typescript
cd my-app
npm install prisma @prisma/client
npm install bcrypt uuid
npm install --save-dev @types/node
```

### 2. Create Folder Structure
```bash
mkdir -p src/{domain,application,infrastructure,presentation,di,config}
mkdir -p src/domain/{entities,repositories,services}
mkdir -p src/application/{dtos,usecases,mappers,interfaces}
mkdir -p src/infrastructure/{database,email,queue,socket}
mkdir -p src/presentation/{pages,components,middleware}
```

### 3. Start with Domain Layer
- Create entities (User, Role, Permission)
- Create repository interfaces
- No implementation yet!

### 4. Build Application Layer
- Create DTOs for each use case
- Create mappers
- Create use cases

### 5. Implement Infrastructure
- Create repository implementations
- Create service implementations
- Setup DI container

### 6. Connect Presentation
- Create API routes
- Hook use cases into routes
- Return DTOs in responses

---

## ⚡ Performance Tips

### Query Optimization
- [ ] Use `select` in Prisma for specific fields
- [ ] Use `include` for relations (not separate queries)
- [ ] Batch load with array WHERE clause
- [ ] Use DataLoader for automatic batching (GraphQL)

### Caching
- [ ] Cache user by ID (1 hour)
- [ ] Cache roles by userID (2 hours)
- [ ] Invalidate on write
- [ ] Use Redis decorator pattern

### Pagination
- [ ] Always paginate list endpoints
- [ ] Use cursor-based pagination for large datasets
- [ ] Don't load all data then filter

---

## 🧪 Testing Strategy

### Unit Tests (Test Domain Layer)
```typescript
// Mock repositories
const mockRepo = { findById: jest.fn() };
const useCase = new GetUserUseCase(mockRepo);

// Test doesn't care about DB
mockRepo.findById.mockResolvedValue(user);
const result = await useCase.execute('123');
expect(result.id).toBe('123');
```

### Integration Tests (Test with Real DB)
```typescript
// Use test database
const prisma = new PrismaClient({ 
  datasources: { db: { url: process.env.TEST_DB_URL } } 
});

const repository = new PostgresUserRepository(prisma);
// Test with real DB, but mock external services
```

### E2E Tests (Full Flow)
```typescript
// Real DB, real API route
await fetch('http://localhost:3000/api/users', { 
  method: 'POST', 
  body: JSON.stringify({...}) 
});

// Verify in database
const user = await prisma.user.findUnique(...);
expect(user.email).toBe('...');
```

---

## 🎓 Learning Path

1. **First**: Read `00_QUICK_START.md` (15 min)
2. **Basic**: Files 01-05 (30 min)
3. **Services**: Files 06-11 (30 min)
4. **Relationships** (IMPORTANT): Files 15-22 (45 min)
5. **Reference**: Files 23-25 (20 min)
6. **Practice**: Build a simple feature using this architecture

---

## 🔗 Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.0.0",
    "uuid": "^9.0.0",
    "socket.io": "^4.0.0",
    "ioredis": "^5.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0"
  }
}
```

---

## 📝 Summary

**Domain Layer**: Pure business logic, no framework knowledge
**Application Layer**: Use cases, DTOs, mappers
**Infrastructure Layer**: Database, email, queue implementations
**Presentation Layer**: API routes, React components

**Key Principles**:
1. Domain entities store IDs only
2. Multiple repository methods for different load levels
3. DTOs are use-case specific
4. Services are abstractions (easily swappable)
5. DI container manages all dependencies

**Benefits**:
- ✅ Easy to test (mock repositories)
- ✅ Easy to change (swap implementations)
- ✅ Easy to extend (add new features without refactoring)
- ✅ Clear separation of concerns
- ✅ No performance issues (controlled loading)

---

## 🤔 FAQ

**Q: Why not just load everything?**
A: Over-fetching wastes bandwidth, slows API, expensive DB queries. Load only what you need.

**Q: Isn't this over-engineered?**
A: For small projects (CRUD), maybe. For scaling projects with complex relationships, essential.

**Q: Can I use a different ORM?**
A: Yes! Repository pattern abstracts the ORM. Just create different implementations (PrismaUserRepository, TypeORMUserRepository, etc).

**Q: Can I use GraphQL instead?**
A: Absolutely! Use same repository methods, same DTOs, same mappers. Just different presentation layer.

**Q: How do I handle circular dependencies?**
A: They shouldn't happen if layers are correct. Domain → Application → Infrastructure. Never the other way.

---

Generated with ❤️ for building scalable Next.js applications
