import { Role } from '../../generated/prisma/client';
import { prisma } from '../../infrastructure/database/postgres';
import { redis } from '../../infrastructure/cache/redis';

const TTL: number = 60 * 60 * 24;

export const RoleRepository = {
  findAll: async (): Promise<Role[]> => {
    const cachedKey = 'roles:all';
    const cached = await redis.get(cachedKey);

    if (cached) {
      return JSON.parse(cached) as Role[];
    }

    const roles = await prisma.role.findMany();
    await redis.set(cachedKey, JSON.stringify(roles), { EX: TTL });
    return roles;
  },

  findById: async (id: string): Promise<Role | null> => {
    const cachedKey = `roles:${id}`;
    const cached = await redis.get(cachedKey);

    if (cached) {
      return JSON.parse(cached) as Role;
    }

    const role = await prisma.role.findUnique({ where: { id } });
    if (role) {
      await redis.set(cachedKey, JSON.stringify(role), { EX: TTL });
    }
    return role;
  },
};
