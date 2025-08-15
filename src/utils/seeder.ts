import { ROLE } from "../config/auth";
import { User } from "../modules/user";

export const seedSuperAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ role: ROLE.SuperAdmin });
        if (existingAdmin) {
            console.log("✅ Super Admin already exists.");
            return;
        }

        const uuid = crypto.randomUUID()
        const superAdmin = new User({
            uuid: uuid.toString(),
            firstName: "Super",
            lastName: "Admin",
            email: "super.admin@admin.com",
            password: "123456789",
            avatarPath: "not",
            role: ROLE.SuperAdmin,
        });

        await superAdmin.save();
        console.log("🚀 Super Admin seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding Super Admin:", error);
    }
};


export async function runSeeder() {
    await seedSuperAdmin()
}


