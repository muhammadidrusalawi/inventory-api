import { redis } from '../../infrastructure/cache/redis';
import { prisma } from '../../infrastructure/database/postgres';
import { User } from '../../generated/prisma/client';

const TTL: number = 600;

export const UserRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    const cacheKey = `user:${email}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as User;

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) await redis.set(cacheKey, JSON.stringify(user), { EX: TTL });
    return user;
  },

  findById: async (id: string): Promise<User | null> => {
    const cacheKey = `user:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as User;

    const user = await prisma.user.findUnique({ where: { id } });
    if (user) await redis.set(cacheKey, JSON.stringify(user), { EX: TTL });
    return user;
  },

  create: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> =>
    prisma.user.create({ data }),

  update: (
    id: string,
    data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>,
  ): Promise<User> => prisma.user.update({ where: { id }, data }),

  upsert: ({
    where,
    create,
    update,
  }: {
    where: { email: string };
    create: Omit<User, 'id' | 'created_at' | 'updated_at'>;
    update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
  }): Promise<User> => prisma.user.upsert({ where, create, update }),

  delete: async (id: string): Promise<User> => {
    await redis.del(`user:${id}`);
    return prisma.user.delete({ where: { id } });
  },

  cacheUser: (user: User): Promise<string | null> =>
    redis.set(`user:${user.email}`, JSON.stringify(user), { EX: TTL }),

  cacheProfile: (user: User): Promise<string | null> =>
    redis.set(`user-profile:${user.id}`, JSON.stringify(user), { EX: TTL }),
};
