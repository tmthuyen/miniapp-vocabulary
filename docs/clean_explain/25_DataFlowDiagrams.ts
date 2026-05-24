/**
 * CLEAN ARCHITECTURE - DATA FLOW WITH RELATIONSHIPS
 * 
 * Shows how data flows through layers with different load levels
 */

// =====================================================
// SCENARIO: Get User with Roles and Permissions
// API: GET /api/users/user-123?loadLevel=with_permissions
// =====================================================

/*
┌─────────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  API ROUTE: /api/users/[id].ts                                      │
│  ├─ Parse query: loadLevel = "with_permissions"                    │
│  ├─ Get use case from DI container                                  │
│  ├─ Call: useCase.execute(userId, loadLevel)                       │
│  └─ Return: { success: true, data: UserDTO }                       │
│                                                                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  USE CASE: GetUserByIdUseCase                                       │
│  ├─ execute(userId, loadLevel)                                      │
│  │                                                                    │
│  ├─ Switch on loadLevel:                                            │
│  │                                                                    │
│  │  case 'with_permissions':                                        │
│  │  ├─ user = userRepository.findById(userId)                      │
│  │  ├─ roles = roleRepository.findByIds(user.roleIds)              │
│  │  ├─ For each role: load permissions in parallel                 │
│  │  │  permissionsByRoleId = Map<roleId, Permission[]>             │
│  │  │                                                                │
│  │  └─ Return UserMapper.toUserWithPermissionsDTO(...)             │
│  │                                                                    │
│  └─ MAPPER: UserWithRolesAndPermissionsDTO                          │
│     └─ { id, email, name, roles: [                                 │
│        { id, name, permissions: [ ... ] }, ...                     │
│     ]}                                                               │
│                                                                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   DOMAIN LAYER                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ENTITIES (Pure business objects):                                  │
│                                                                       │
│  User {                                                              │
│    id: string;                                                      │
│    email: string;                                                   │
│    name: string;                                                    │
│    roleIds: string[];  ← IDs ONLY, not Role objects!              │
│  }                                                                   │
│                                                                       │
│  Role {                                                              │
│    id: string;                                                      │
│    name: string;                                                    │
│    permissionIds: string[];  ← IDs ONLY, not Permission objects!  │
│  }                                                                   │
│                                                                       │
│  Permission {                                                        │
│    id: string;                                                      │
│    name: string;                                                    │
│    resource: string;                                                │
│    action: string;                                                  │
│  }                                                                   │
│                                                                       │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ↓                     ↓                     ↓
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ INFRASTRUCTURE   │  │ INFRASTRUCTURE   │  │ INFRASTRUCTURE   │
│ USER REPOSITORY  │  │ ROLE REPOSITORY  │  │PERMISSION REP.   │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│                  │  │                  │  │                  │
│ findById()       │  │ findByIds()      │  │ findByIds()      │
│  ↓               │  │  ↓               │  │  ↓               │
│ Prisma.user      │  │ Prisma.role      │  │ Prisma.permission
│  .findUnique({   │  │  .findMany({     │  │  .findMany({     │
│   where: {id}    │  │   where:{id in } │  │   where:{id in } │
│ })               │  │ })               │  │ })               │
│                  │  │                  │  │                  │
│ Maps: Raw DB →   │  │ Maps: Raw DB →   │  │ Maps: Raw DB →   │
│ User Entity      │  │ Role Entity      │  │ Permission Entity│
│                  │  │                  │  │                  │
└────────────┬─────┘  └────────┬─────────┘  └────────┬─────────┘
             │                 │                     │
             └─────────────────┼─────────────────────┘
                               │
                               ↓
                    ┌──────────────────┐
                    │   DATABASE       │
                    │                  │
                    │ SELECT u.* FROM  │
                    │ user u           │
                    │ WHERE u.id = $1  │
                    │                  │
                    │ SELECT r.* FROM  │
                    │ role r           │
                    │ WHERE r.id IN    │
                    │ (SELECT roles    │
                    │  FROM user_roles │
                    │  WHERE user_id=$1)
                    │                  │
                    │ SELECT p.* FROM  │
                    │ permission p     │
                    │ WHERE p.id IN    │
                    │ (SELECT ...      │
                    │  FROM role_...) │
                    │                  │
                    └──────────────────┘
*/

// =====================================================
// DETAILED: How Mappers Transform Data
// =====================================================

/*

Raw DB Data:
────────────

user_row: { 
  id: "u1", email: "john@test.com", name: "John",
  roleIds: ["r1", "r2"]  
}

roles_rows: [
  { id: "r1", name: "admin", description: "Admin role" },
  { id: "r2", name: "editor", description: "Editor role" }
]

permission_rows: [
  { id: "p1", name: "users.create", resource: "users", action: "create" },
  { id: "p2", name: "users.delete", resource: "users", action: "delete" },
  { id: "p3", name: "posts.create", resource: "posts", action: "create" }
]

role_permission_mapping: {
  "r1": ["p1", "p2"], // admin has p1, p2
  "r2": ["p3"]        // editor has p3
}

                             │
                             ↓
                             
Domain Entities:
────────────────

user: User {
  id: "u1",
  email: "john@test.com",
  name: "John",
  roleIds: ["r1", "r2"]
}

roles: [
  Role { id: "r1", name: "admin", permissionIds: ["p1", "p2"] },
  Role { id: "r2", name: "editor", permissionIds: ["p3"] }
]

permissions: Map {
  "p1" → Permission { id: "p1", resource: "users", action: "create" },
  "p2" → Permission { id: "p2", resource: "users", action: "delete" },
  "p3" → Permission { id: "p3", resource: "posts", action: "create" }
}

                             │
                             ↓
                             
UserMapper.toUserWithPermissionsDTO():
────────────────────────────────────

1. Extract basic user info
   └─ { id, email, name }

2. For each role, get its permissions
   roles.map(role => {
     permissions = permissionsMap.get(role.permissionIds)
     return { 
       id: role.id,
       name: role.name,
       permissions: permissions.map(p => ({
         id: p.id,
         resource: p.resource,
         action: p.action
       }))
     }
   })

                             │
                             ↓
                             
Final DTO Response:
───────────────────

{
  id: "u1",
  email: "john@test.com",
  name: "John",
  roles: [
    {
      id: "r1",
      name: "admin",
      permissions: [
        { id: "p1", resource: "users", action: "create" },
        { id: "p2", resource: "users", action: "delete" }
      ]
    },
    {
      id: "r2",
      name: "editor",
      permissions: [
        { id: "p3", resource: "posts", action: "create" }
      ]
    }
  ]
}
*/

// =====================================================
// QUERY FLOW: Parallel vs Sequential
// =====================================================

/*
SEQUENTIAL (Slow - O(n)):
────────────────────────

1. Get user                          [10ms]
2. Get roles for this user           [15ms]
3. Get permissions for role 1        [20ms]
4. Get permissions for role 2        [20ms]
────────────────────────────────────
   Total: 65ms


PARALLEL (Fast - O(1)):
───────────────────────

1. Get user                                    [10ms] ─┐
2. Get roles                                   [15ms] ─┤
3. Get all permissions in 1 query              [20ms] ─┤ All at once
4. Map everything                              [5ms]  ─┤
────────────────────────────────────────────────────────
   Total: 25ms (only the slowest step)


How to code it:

// Sequential (BAD)
const user = await userRepo.findById(id);
const roles = await roleRepo.findByIds(user.roleIds);
for (const role of roles) {
  const perms = await permRepo.findByIds(role.permissionIds); // N queries!
}
// Total: 1 + 1 + N queries

// Parallel (GOOD)
const user = await userRepo.findById(id);
const roles = await roleRepo.findByIds(user.roleIds);

// Get ALL permission IDs at once
const allPermIds = roles.flatMap(r => r.permissionIds);
const allPerms = await permRepo.findByIds(allPermIds); // 1 query!
const permMap = new Map(allPerms.map(p => [p.id, p]));

// Map back to roles
const rolesWithPerms = roles.map(r => ({
  ...r,
  permissions: r.permissionIds.map(pid => permMap.get(pid))
}));
// Total: 3 queries max
*/

// =====================================================
// LOAD LEVELS: What Gets Loaded When
// =====================================================

/*
GET /api/users/123              → Level 0: BASIC
├─ User entity only
├─ NO relations loaded
└─ Fastest, lightest response

   UserResponseDTO { id, email, name }


GET /api/users/123?roles=true   → Level 1: WITH_ROLES
├─ User entity
├─ Roles loaded
├─ NO permissions
└─ One level deep

   UserWithRolesDTO { 
     id, email, name, 
     roles: [{ id, name, description }, ...] 
   }


GET /api/users/123?permissions=true  → Level 2: WITH_PERMISSIONS
├─ User entity
├─ Roles loaded
├─ Permissions loaded for each role
└─ Two levels deep

   UserWithRolesAndPermissionsDTO { 
     id, email, name,
     roles: [{
       id, name,
       permissions: [{ id, resource, action }, ...]
     }, ...]
   }


GET /api/users/123?full=true    → Level 3: FULL
├─ User entity
├─ Roles loaded
├─ Permissions for each role
├─ Addresses loaded
├─ Sessions loaded
└─ Multiple branches, complete profile

   UserFullProfileDTO {
     id, email, name,
     roles: [...],
     addresses: [...],
     sessions: [...]
   }
*/

// =====================================================
// CACHING STRATEGY
// =====================================================

/*
Cache Key Hierarchy:
────────────────────

user:123              → Basic user info (3600s)
user:123:roles        → User + roles (7200s)
user:123:permissions  → User + roles + permissions (3600s)
user:123:full         → Complete profile (1800s)
users:all             → All users list (600s)


Invalidation Cascades:
──────────────────────

When user updates:
  INVALIDATE: user:123
  INVALIDATE: user:123:roles
  INVALIDATE: user:123:permissions
  INVALIDATE: user:123:full
  INVALIDATE: users:all

When role updates:
  INVALIDATE: role:r1
  FOR EACH user with this role:
    INVALIDATE: user:{userId}:roles
    INVALIDATE: user:{userId}:permissions


Decorator Pattern:
──────────────────

class CachedUserRepository {
  constructor(innerRepo, cache) {}
  
  async findById(id) {
    const key = `user:${id}`;
    const cached = await cache.get(key);
    if (cached) return cached; // Cache HIT
    
    const data = await innerRepo.findById(id); // Cache MISS
    if (data) await cache.set(key, data, 3600);
    return data;
  }
  
  async update(user) {
    const result = await innerRepo.update(user);
    await this.invalidateCache(user.id);
    return result;
  }
}
*/

// =====================================================
// DEPENDENCY INJECTION CONTAINER
// =====================================================

/*
Container.getInstance()
  ├─ PrismaClient (singleton)
  │
  ├─ Repositories:
  │  ├─ IUserRepository → PostgresUserRepository
  │  ├─ IRoleRepository → PostgresRoleRepository
  │  └─ IPermissionRepository → PostgresPermissionRepository
  │
  ├─ Services:
  │  ├─ IEmailService → SendgridEmailService (prod) or MockEmailService (test)
  │  ├─ IQueueService → RedisQueueService (prod) or InMemoryQueueService (test)
  │  └─ ICacheService → RedisCache (prod) or InMemoryCache (test)
  │
  ├─ Use Cases:
  │  ├─ GetUserByIdUseCase
  │  └─ CreateUserUseCase
  │
  └─ Event Bus & Subscribers


How it solves problems:
─────────────────────

// Test: Easy to mock
const mockRepo = { findById: jest.fn() };
const useCase = new GetUserByIdUseCase(mockRepo);

// Swap implementations:
// Development: MockEmailService
// Production: SendgridEmailService
// Just change container setup!

// Add new service without refactoring:
// All dependencies injected automatically
*/
