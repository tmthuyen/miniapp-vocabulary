// CLEAN ARCHITECTURE - HANDLING RELATIONSHIPS BEST PRACTICES

/**
 * KEY PRINCIPLES:
 * 
 * 1. Domain Entities: Chỉ chứa IDs của related entities, KHÔNG chứa objects
 * 2. Repository Methods: Có multiple versions để load different levels
 * 3. DTOs: Một DTO cho mỗi use case/response scenario
 * 4. Mappers: Chuyển đổi giữa entities và DTOs
 */

// ============= PATTERN 1: ENTITY COMPOSITION =============
// Domain entity chỉ lưu IDs

class User {
  id: string;
  email: string;
  roleIds: string[];        // NOT Role[]
  addressIds: string[];     // NOT Address[]
}

// Lợi ích:
// - Entities không phụ thuộc vào database schema
// - Dễ test (mock repositories)
// - Flexible: có thể change storage, shard across databases, etc.
// - Entities là immutable, lightweight

// ============= PATTERN 2: EXPLICIT LOAD LEVELS =============

// Repository có multiple find methods:
interface UserRepository {
  // Basic - không load relations
  findById(id): User;
  
  // Load 1 level - user + roles
  findByIdWithRoles(id): { user: User; roles: Role[] };
  
  // Load 2 levels - user + roles + permissions
  findByIdWithPermissions(id): { user: User; roles: RoleWithPermissions[] };
  
  // Full load - tất cả
  findByIdFull(id): UserFullProfile;
  
  // Custom - select specific relations
  findByIdWithProjection(id, options: {
    includeRoles?: boolean;
    includeAddresses?: boolean;
  }): UserProjection;
}

// Lợi ích:
// - Tránh over-fetching (lấy data không cần)
// - Tránh under-fetching (quay lại API nhiều lần)
// - Clear intent: method name nói rõ sẽ load gì

// ============= PATTERN 3: N+1 QUERY PREVENTION =============

// BAD: N+1 queries
const users = await userRepository.findAll(); // 1 query
for (const user of users) {
  const roles = await roleRepository.findByIds(user.roleIds); // N queries
}

// GOOD: Batch load or join
const usersWithRoles = await userRepository.findAllWithRoles(); // 1 query with JOIN

// BETTER: DataLoader for automatic batching
const users = await Promise.all(
  ids.map(id => userRepository.findById(id)) // Dataloader batches automatically
);

// ============= PATTERN 4: DTO STRATEGY =============

// Different API responses need different DTOs

// List endpoint: chỉ cần basic + roles
GET /api/users -> UserWithRolesDTO[]

// Detail endpoint: có thể full profile
GET /api/users/123 -> UserFullProfileDTO

// Admin panel: cần permissions
GET /api/users/123?roles=true&permissions=true -> UserWithRolesAndPermissionsDTO

// Mobile app: minimal data
GET /api/users/123?projection=basic -> UserResponseDTO

// ============= PATTERN 5: LAZY vs EAGER LOADING =============

// EAGER: Load all at once
const user = await repository.findByIdFull(userId);
console.log(user.roles); // Available immediately

// LAZY: Load on demand
const user = await repository.findById(userId);
const roles = await repository.loadRoles(userId); // Load when needed

// Choose based on use case:
// - Eager: API responses, SSR pages
// - Lazy: Background jobs, one-off queries, memory constraints

// ============= PATTERN 6: CACHE STRATEGY =============

// Cache user + roles separately
cache.set('user:123', user, 3600);
cache.set('user:123:roles', roles, 7200);

// Or cache composite
cache.set('user:123:full', fullProfile, 3600);

// Invalidate granularly
await cache.delete('user:123'); // All caches for this user
await cache.delete('user:123:roles');

// ============= PATTERN 7: HANDLING DEEP NESTING =============

// Problem: User -> Roles -> Permissions (3 levels deep)
// Solution: Load in stages, flatten for response

async function getUserWithEverything(userId) {
  // Stage 1: Get user
  const user = await userRepository.findById(userId);
  
  // Stage 2: Get roles in parallel with addresses + sessions
  const [roles, addresses, sessions] = await Promise.all([
    roleRepository.findByIds(user.roleIds),
    addressRepository.findByUserId(userId),
    sessionRepository.findByUserId(userId),
  ]);
  
  // Stage 3: Get permissions for each role in parallel
  const permissionsByRole = await Promise.all(
    roles.map(role => 
      permissionRepository.findByIds(role.permissionIds)
    )
  );
  
  // Stage 4: Map to DTO
  return UserMapper.toFullProfileDTO(
    user,
    roles,
    new Map(roles.map((r, i) => [r.id, permissionsByRole[i]])),
    addresses,
    sessions
  );
}

// Benefits:
// - Parallel loading stages (not sequential)
// - Flexible depth control
// - Testable (mock each repository independently)

// ============= PATTERN 8: FILTERING BY RELATIONSHIPS =============

// Query users by permission (complex JOIN)
async findUsersByPermission(permissionId) {
  // Option 1: Query database directly with JOIN
  return this.prisma.user.findMany({
    where: {
      roles: {
        some: {
          permissions: { some: { id: permissionId } }
        }
      }
    }
  });
  
  // Option 2: Separate queries (if DB doesn't support complex WHERE)
  const roles = await roleRepository.findWithPermission(permissionId);
  const userIds = roles.flatMap(r => r.userIds); // If tracking inverse relationships
  return this.findByIds(userIds);
}

// ============= PATTERN 9: UPDATE WITH RELATIONSHIPS =============

// When updating user's roles:

async updateUserRoles(userId, newRoleIds) {
  // Load current user
  const user = await this.findById(userId);
  
  // Update IDs in domain entity
  user.roleIds = newRoleIds;
  
  // Save to repository
  await this.update(user);
  
  // Invalidate cache
  await cache.delete(`user:${userId}`);
  await cache.delete(`user:${userId}:roles`);
  
  // Emit event for subscribers
  await eventBus.emit({
    type: 'USER_ROLES_UPDATED',
    payload: { userId, newRoleIds }
  });
}

// ============= PATTERN 10: AUDIT & SOFT DELETE =============

// Track who assigned what role and when
model UserRole {
  userId: string;
  roleId: string;
  assignedAt: datetime;
  assignedBy: string; // User ID who made this assignment
  deletedAt?: datetime; // Soft delete
}

// Query only active relationships
findByIdWithActiveRoles(userId) {
  return this.prisma.userRole.findMany({
    where: { 
      userId,
      deletedAt: null // Only active
    }
  });
}

// ============= MIGRATION PATH =============

// Start simple:
// 1. Basic user + IDs only
// 2. Add findByIdWithRoles
// 3. Add caching layer
// 4. Add more specific DTOs based on API usage
// 5. Add DataLoader for GraphQL/heavy queries

// Don't premature optimize:
// - Start with simple find methods
// - Profile queries (find N+1 issues)
// - Optimize based on actual bottlenecks

// ============= TESTING PATTERNS =============

describe('GetUserWithRoles', () => {
  it('should load user and roles', async () => {
    // Mock repositories
    const userRepo = createMockUserRepository();
    const roleRepo = createMockRoleRepository();
    
    const useCase = new GetUserWithRolesUseCase(userRepo, roleRepo);
    
    // Mock data
    userRepo.mockFindById({ id: '123', roleIds: ['role-1'] });
    roleRepo.mockFindByIds(['role-1'], [{ id: 'role-1', name: 'admin' }]);
    
    // Execute
    const result = await useCase.execute('123');
    
    // Assert
    expect(result.user.id).toBe('123');
    expect(result.roles).toHaveLength(1);
  });
});

// ============= REAL WORLD EXAMPLE =============

// E-commerce: Get product with inventory by warehouse

// Domain Entity
class Product {
  id: string;
  name: string;
  warehouseIds: string[]; // NOT inventory objects
}

// DTOs
class ProductBasicDTO { id, name }
class ProductWithInventoryDTO { id, name, inventory: InventoryDTO[] }

// Use Case
async function getProductWithInventory(productId) {
  // Load product
  const product = await productRepository.findById(productId);
  
  // Load inventory for all warehouses in parallel
  const inventories = await Promise.all(
    product.warehouseIds.map(wId => 
      inventoryRepository.findByProductAndWarehouse(productId, wId)
    )
  );
  
  // Return mapped DTO
  return {
    ...product,
    inventory: inventories.map(i => ({ warehouseId: i.warehouseId, qty: i.quantity }))
  };
}

// API
GET /api/products/prod-123 -> ProductBasicDTO (fast)
GET /api/products/prod-123?inventory=true -> ProductWithInventoryDTO (slower but complete)
