import { prisma } from '@/infrastructure/database/prisma/client';
import { generateUniqueId } from '@/shared/utils/idUtils';
import bcrypt from 'bcryptjs';

async function main() {
    // seed roles
    // xóa all roles
    await prisma.role.deleteMany();
    const roles = ['admin', 'user'];
    for (const roleName of roles) {
        const id = generateUniqueId();
        await prisma.role.upsert({
            where: { code: roleName.toUpperCase() },
            update: { name: roleName },
            create: { id, name: roleName, code: roleName.toUpperCase() },
        });
    }
    // =====
    // seed admin user
    // seed admin profile
    const admin = {
        id: '0001',
        full_name: 'Admin User',
        status: 'active' as const,
        avatar_url: null,
        target_band: 6.0,
        vip_plan: 'vip_pro' as const,
        vip_expired_at: new Date('2027-12-31'),
        created_at: new Date(),
        created_by: 'Admin Seeder',
        updated_at: new Date(),
        updated_by: 'Admin Seeder',
    };
    const adminProfile = await prisma.userProfile.upsert({
        where: { id: admin.id },
        update: admin,
        create: { ...admin },
    });

    // seed admin role
    for (const roleName of roles) {
        const role = await prisma.role.findFirst({ where: { code: roleName.toUpperCase() } });
        
        console.log(`Seeding role '${roleName}' for admin:`, role ? 'Found' : 'Not found');
        console.log(role)
        if (role) {
            // Delete existing user roles for this user to avoid duplicates
            await prisma.userRole.deleteMany({
                where: { user_id: adminProfile.id, role_id: role.id },
            });
            await prisma.userRole.create({
                data: {
                    id: generateUniqueId(),
                    user_id: adminProfile.id,
                    role_id: role.id,
                    created_at: new Date(),
                    created_by: 'Admin Seeder',
                    updated_at: new Date(),
                    updated_by: 'Admin Seeder',
                },
            });
        }
    }

    // seed admin auth provider
    const passwordHash = await bcrypt.hash('123456', 10);
    const adminAuth = {
        id: "0001",
        user_id: adminProfile.id,
        provider_type: 'local',
        email: 'admin@gmail.com',
        password_hash: passwordHash,
        created_at: new Date(),
        created_by: 'Admin Seeder',
        updated_at: new Date(),
        updated_by: 'Admin Seeder',
    };
    // Delete existing local auth provider for this user
    await prisma.userAuthProvider.deleteMany({
        where: {
            email: adminAuth.email,
            provider_type: 'local',
        },
    });
    await prisma.userAuthProvider.create({
        data: { ...adminAuth },
    });

    console.log('Seeded admin:', adminAuth.email);
}

main().finally(async () => {
    await prisma.$disconnect();
});
