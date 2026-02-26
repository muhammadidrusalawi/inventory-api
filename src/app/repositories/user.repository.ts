import { redis } from '../../infrastructure/cache/redis';
import { prisma } from '../../infrastructure/database/postgres';
import { Prisma, User } from '../../generated/prisma/client';

const TTL: number = 600;

export const UserRepository = {
  findByEmail: async (email: string): Promise<User | null> => {
    const cacheKey = `user:email:${email}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as User;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await redis.set(cacheKey, JSON.stringify(user), { EX: TTL });
      await redis.set(`user:id:${user.id}`, JSON.stringify(user), { EX: TTL });
    }

    return user;
  },

  findById: async (id: string): Promise<User | null> => {
    const cacheKey = `user:id:${id}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as User;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      await redis.set(cacheKey, JSON.stringify(user), { EX: TTL });
      await redis.set(`user:email:${user.email}`, JSON.stringify(user), { EX: TTL });
    }

    return user;
  },

  findByIdWithStore: async (
    id: string,
  ): Promise<Prisma.UserGetPayload<{
    select: {
      id: true;
      email: true;
      name: true;
      storeUsers: {
        select: {
          store: {
            select: {
              id: true;
              name: true;
              plan: true;
            };
          };
          role: {
            select: {
              id: true;
              key: true;
              label: true;
            };
          };
        };
      };
    };
  }> | null> => {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        storeUsers: {
          select: {
            store: {
              select: {
                id: true,
                name: true,
                plan: true,
              },
            },
            role: {
              select: {
                id: true,
                key: true,
                label: true,
              },
            },
          },
        },
      },
    });
  },

  create: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> =>
    prisma.user.create({ data }),

  upsert: ({
    where,
    create,
    update,
  }: {
    where: { email: string };
    create: Omit<User, 'id' | 'created_at' | 'updated_at'>;
    update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
  }): Promise<User> => prisma.user.upsert({ where, create, update }),

  updatePassword: async (id: string, hashedPassword: string): Promise<void> => {
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    await redis.del(`user:id:${id}`);
  },

  delete: async (id: string): Promise<User> => {
    const user = await prisma.user.delete({ where: { id } });

    await redis.del(`user:id:${id}`);
    await redis.del(`user:email:${user.email}`);

    return user;
  },
};
