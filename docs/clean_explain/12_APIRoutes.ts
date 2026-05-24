// src/presentation/pages/api/users/index.ts
// Next.js API route - Presentation layer

import type { NextApiRequest, NextApiResponse } from 'next';
import { Container } from '@/di/Container';
import { CreateUserUseCase } from '@/application/usecases/user/CreateUserUseCase';
import { CreateUserDTO } from '@/application/dtos/CreateUserDTO';
import { UserResponseDTO } from '@/application/dtos/UserResponseDTO';

type Response = {
  success?: boolean;
  data?: UserResponseDTO | UserResponseDTO[];
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    const container = Container.getInstance();

    if (req.method === 'POST') {
      // Create user
      const { email, name, password } = req.body;

      // Validate input
      if (!email || !name || !password) {
        return res.status(400).json({
          error: 'Missing required fields: email, name, password',
        });
      }

      // Create DTO
      const createUserDTO = new CreateUserDTO(email, name, password);

      // Get use case from container
      const createUserUseCase = container.get<CreateUserUseCase>(
        'CreateUserUseCase'
      );

      // Execute use case
      const user = await createUserUseCase.execute(createUserDTO);

      // Return response
      return res.status(201).json({
        success: true,
        data: user,
      });
    }

    if (req.method === 'GET') {
      // List users
      const userRepository = container.get<IUserRepository>(
        'IUserRepository'
      );
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

      const users = await userRepository.findAll(limit, offset);
      return res.status(200).json({
        success: true,
        data: users,
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

// src/presentation/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Container } from '@/di/Container';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { UserMapper } from '@/application/mappers/UserMapper';

type Response = {
  success?: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  try {
    const { id } = req.params as { id: string };
    const container = Container.getInstance();
    const userRepository = container.get<IUserRepository>('IUserRepository');

    if (req.method === 'GET') {
      const user = await userRepository.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        data: UserMapper.toResponseDTO(user),
      });
    }

    if (req.method === 'PUT') {
      // Update user
      const user = await userRepository.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user logic here...
      // const updated = await userRepository.update(updatedUser);

      return res.status(200).json({
        success: true,
        data: user,
      });
    }

    if (req.method === 'DELETE') {
      const deleted = await userRepository.delete(id);

      if (!deleted) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
