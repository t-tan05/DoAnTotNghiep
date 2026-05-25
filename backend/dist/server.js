import 'dotenv/config';
import app from '#app';
import prisma from '#config/prisma';
import bcrypt from "bcrypt";
//Test connect database
async function testDB() {
    try {
        await prisma.$connect();
        console.log("Database connected");
    }
    catch (err) {
        console.log(err);
    }
}
testDB();
const seedAdmin = async () => {
    const existedAdmin = await prisma.users.findUnique({
        where: {
            email: "admin@gmail.com"
        }
    });
    if (!existedAdmin) {
        const userId = crypto.randomUUID();
        const password = "123456";
        const hashPassword = await bcrypt.hash(password, 10);
        const user = await prisma.$transaction(async (tx) => {
            await tx.roles.upsert({
                where: {
                    role_name: "ADMIN",
                },
                update: {},
                create: {
                    role_name: "ADMIN",
                    description: "Quản trị viên hệ thống",
                },
            });
            const admin = await tx.users.create({
                data: {
                    user_id: userId,
                    email: "admin@gmail.com",
                    name: "Admin",
                    pass_word: hashPassword,
                    verified: true,
                }
            });
            await tx.users_roles.create({
                data: {
                    user_id: userId,
                    role_name: "ADMIN",
                }
            });
        });
        console.log("Đã tạo admin với password: 123456 vui lòng đổi mật khẩu");
    }
};
seedAdmin();
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
