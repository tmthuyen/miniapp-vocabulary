import { prisma } from '@/infrastructure/database/prisma/client';
import { generateUniqueId } from '@/shared/utils/idUtils';
import bcrypt from 'bcryptjs';

async function main() {
    // seed roles
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
        id: generateUniqueId(),
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
        const role = await prisma.role.findFirst({ where: { name: roleName } });
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
                },
            });
        }
    }

    // seed admin auth provider
    const passwordHash = await bcrypt.hash('123456', 10);
    const adminAuth = {
        id: generateUniqueId(),
        user_id: adminProfile.id,
        provider_type: 'local',
        provider_user_id: 'admin@gmail.com',
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
            user_id: adminProfile.id,
            provider_type: 'local',
        },
    });
    await prisma.userAuthProvider.create({
        data: { ...adminAuth },
    });

    //   const email = "admin@gmail.com"
    //   const passwordHash = await bcrypt.hash("123456", 10)

    //   const id = generateUniqueId()

    //   const user = await prisma.userProfile.upsert({
    //     where: { id },
    //     update: { target_band: 6.0, vip_plan: "vip_pro", vip_expired_at: new Date("2027-12-31") },
    //     create: { id, email, password_hash: passwordHash },
    //   })

    //   await prisma.userProfile.upsert({
    //     where: { id: user.id },
    //     update: { role: "admin", vip_plan: "vip_pro", vip_expired_at: null },
    //     create: { id: user.id, role: "admin", vip_plan: "vip_pro", vip_expired_at: null },
    //   })

    console.log('Seeded admin:', adminAuth.email);
}

main().finally(async () => {
    await prisma.$disconnect();
});
