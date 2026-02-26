import { Permission } from '../../generated/prisma/client';
import { prisma } from '../../infrastructure/database/postgres';
import { redis } from '../../infrastructure/cache/redis';

const TTL: number = 60 * 60 * 24;

export const PermissionRepository = {
  findAll: async (): Promise<Permission[]> => {
    const cachedKey = 'permissions:all';
    const cached = await redis.get(cachedKey);

    if (cached) {
      return JSON.parse(cached) as Permission[];
    }

    const permissions = await prisma.permission.findMany();
    await redis.set(cachedKey, JSON.stringify(permissions), { EX: TTL });
    return permissions;
  },

  findById: async (id: string): Promise<Permission | null> => {
    const cachedKey = `permissions:${id}`;
    const cached = await redis.get(cachedKey);

    if (cached) {
      return JSON.parse(cached) as Permission;
    }

    const permission = await prisma.permission.findUnique({ where: { id } });
    if (permission) {
      await redis.set(cachedKey, JSON.stringify(permission), { EX: TTL });
    }
    return permission;
  },
};
