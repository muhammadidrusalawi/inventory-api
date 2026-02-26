import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg'
import { hashSync } from 'bcrypt-ts';
import configDotenv from "dotenv";

configDotenv.config();

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({
    adapter,
});

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Alice",
        email: "alice@invento.com",
        password: hashSync('12345678', 10),
        verified_at: new Date()
    },
    {
        name: "Bob",
        email: "bob@invento.com",
        password: hashSync('12345678', 10),
        verified_at: new Date()
    },
    {
      name: "Alexander Asep",
      email: "alex@invento.com",
      password: hashSync('12345678', 10),
      verified_at: new Date()
    },
];

const roleData: Prisma.RoleCreateInput[] = [
  {
    key: "OWNER",
    label: "Owner",
    description: "Pemilik Toko"
  },
  {
    key: "ADMIN",
    label: "Admin",
    description: "Admin Toko"
  },
  {
    key: "STAFF",
    label: "Staff",
    description: "Staff Penjualan/Operasional"
  },
  {
    key: "FINANCE",
    label: "Finance",
    description: "Pengelola keuangan"
  },
];

const permissionData: Prisma.PermissionCreateInput[] = [
  // ===== DASHBOARD =====
  {
    key: 'dashboard:view',
    label: 'Lihat Dashboard',
    description: 'Mengakses ringkasan dashboard',
    group: 'Dashboard',
  },

  // ===== PRODUCT =====
  {
    key: 'product:view',
    label: 'Lihat Produk',
    description: 'Melihat daftar produk',
    group: 'Produk',
  },
  {
    key: 'product:create',
    label: 'Tambah Produk',
    description: 'Menambahkan produk baru',
    group: 'Produk',
  },
  {
    key: 'product:update',
    label: 'Ubah Produk',
    description: 'Mengubah data produk',
    group: 'Produk',
  },
  {
    key: 'product:delete',
    label: 'Hapus Produk',
    description: 'Menghapus produk',
    group: 'Produk',
  },

  // ===== STOCK =====
  {
    key: 'stock:manage',
    label: 'Kelola Stok',
    description: 'Mengelola stok masuk dan keluar',
    group: 'Stok',
  },

  // ===== PURCHASE ORDER =====
  {
    key: 'po:view',
    label: 'Lihat Purchase Order',
    description: 'Melihat daftar PO',
    group: 'Purchase Order',
  },
  {
    key: 'po:manage',
    label: 'Kelola Purchase Order',
    description: 'Membuat dan mengubah PO',
    group: 'Purchase Order',
  },

  // ===== SALES ORDER / POS =====
  {
    key: 'so:view',
    label: 'Lihat Sales Order',
    description: 'Melihat transaksi penjualan',
    group: 'Sales Order',
  },
  {
    key: 'so:manage',
    label: 'Kelola Sales Order / POS',
    description: 'Membuat transaksi penjualan / POS',
    group: 'Sales Order',
  },

  // ===== REPORT =====
  {
    key: 'report:view',
    label: 'Lihat Laporan',
    description: 'Mengakses laporan penjualan dan stok',
    group: 'Laporan',
  },

  // ===== USER & ROLE =====
  {
    key: 'user:manage',
    label: 'Kelola Pengguna',
    description: 'Menambah dan mengatur pengguna toko',
    group: 'Manajemen Akses',
  },
  {
    key: 'role:manage',
    label: 'Kelola Role & Permission',
    description: 'Mengatur role dan permission',
    group: 'Manajemen Akses',
  },
];

export async function main() {
    for (const u of userData) {
        await prisma.user.create({ data: u });
    }

    for (const r of roleData) {
        await prisma.role.create({ data: r });
    }

    for (const p of permissionData) {
        await prisma.permission.create({ data: p });
    }
}

main();