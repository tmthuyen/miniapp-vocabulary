// src/presentation/pages/api/users/[id].ts
// API route demonstrating different response types based on query params

import type { NextApiRequest, NextApiResponse } from 'next';
import { Container } from '@/di/Container';
import { GetUserByIdUseCase, UserLoadLevel } from '@/application/usecases/user/GetUserByIdUseCase';
import { GetUserProfileUseCase } from '@/application/usecases/user/GetUserProfileUseCase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { id } = req.query as { id: string };
    const container = Container.getInstance();

    if (req.method === 'GET') {
      // Query params để kiểm soát load level
      // ?loadLevel=basic | with_roles | with_permissions | full
      // ?projection=roles,permissions,addresses

      const loadLevel = (req.query.loadLevel as string) || UserLoadLevel.BASIC;
      const projection = (req.query.projection as string)?.split(',') || [];

      // Nếu dùng projection specific fields
      if (projection.length > 0) {
        const getUserProfileUseCase = container.get<GetUserProfileUseCase>(
          'GetUserProfileUseCase'
        );

        const result = await getUserProfileUseCase.execute(id, {
          includeRoles: projection.includes('roles'),
          includeAddresses: projection.includes('addresses'),
          includeSessions: projection.includes('sessions'),
          includePermissions: projection.includes('permissions'),
        });

        return res.status(200).json({
          success: true,
          data: result,
        });
      }

      // Nếu dùng load level
      const getUserByIdUseCase = container.get<GetUserByIdUseCase>(
        'GetUserByIdUseCase'
      );

      const user = await getUserByIdUseCase.execute(
        id,
        loadLevel as UserLoadLevel
      );

      return res.status(200).json({
        success: true,
        data: user,
      });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

// Usage examples:
// GET /api/users/user-123                          -> Basic user info only
// GET /api/users/user-123?loadLevel=with_roles     -> User + roles
// GET /api/users/user-123?loadLevel=with_permissions -> User + roles + permissions
// GET /api/users/user-123?loadLevel=full           -> Everything
// GET /api/users/user-123?projection=roles,permissions -> Only roles & permissions

// src/presentation/pages/api/users/profile.ts
// Custom profile endpoint

import type { NextApiRequest, NextApiResponse } from 'next';
import { Container } from '@/di/Container';
import { GetUserProfileUseCase } from '@/application/usecases/user/GetUserProfileUseCase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get userId from session/token
    const userId = req.query.userId as string; // hoặc từ auth middleware
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const container = Container.getInstance();
    const getUserProfileUseCase = container.get<GetUserProfileUseCase>(
      'GetUserProfileUseCase'
    );

    // Query params control what to include
    const profile = await getUserProfileUseCase.execute(userId, {
      includeRoles: req.query.roles === 'true',
      includeAddresses: req.query.addresses === 'true',
      includeSessions: req.query.sessions === 'true',
      includePermissions: req.query.permissions === 'true',
    });

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

// Usage:
// GET /api/users/profile?userId=user-123&roles=true&addresses=true

// src/presentation/pages/api/users/index.ts
// List users with roles

import type { NextApiRequest, NextApiResponse } from 'next';
import { Container } from '@/di/Container';
import { ListUsersWithRolesUseCase } from '@/application/usecases/user/ListUsersWithRolesUseCase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

    const container = Container.getInstance();
    const listUsersUseCase = container.get<ListUsersWithRolesUseCase>(
      'ListUsersWithRolesUseCase'
    );

    const users = await listUsersUseCase.execute(limit, offset);

    res.status(200).json({
      success: true,
      data: users,
      pagination: { limit, offset },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

// src/presentation/pages/api/users/search/by-permission.ts
// Search users by permission

import type { NextApiRequest, NextApiResponse } from 'next';
import { Container } from '@/di/Container';
import { SearchUsersByPermissionUseCase } from '@/application/usecases/user/SearchUsersByPermissionUseCase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { resource, action } = req.query as {
      resource: string;
      action: string;
    };

    if (!resource || !action) {
      return res.status(400).json({
        error: 'Missing required query params: resource, action',
      });
    }

    const container = Container.getInstance();
    const searchUsersUseCase = container.get<SearchUsersByPermissionUseCase>(
      'SearchUsersByPermissionUseCase'
    );

    const users = await searchUsersUseCase.execute(resource, action);

    res.status(200).json({
      success: true,
      data: users,
      query: { resource, action },
    });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}

// Usage: GET /api/users/search/by-permission?resource=users&action=delete
