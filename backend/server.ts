import 'dotenv/config';
import app from '#app';
import prisma from '#config/prisma';
import logger from '#config/logger';
import bcrypt from "bcrypt";
import http from "http";
import { initSocket } from './src/socket.js';

//Test connect database
async function testDB() {
    try{
        await prisma.$connect();
        logger.info("Database connected");
    }catch(err){
        logger.error({ err }, "Database connection failed");
    }
}

testDB();

const seedAdmin = async() => {

    const existedAdmin = await prisma.users.findUnique({
        where: {
            email: "admin@gmail.com"
        }
    });

    if(!existedAdmin){
        const userId = crypto.randomUUID();
        const password = "123456";
        const hashPassword = await bcrypt.hash(password, 10);
    
        await prisma.$transaction(async(tx) => {
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
            await tx.users.create({
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
            })
        })
        logger.warn("Đã tạo tài khoản admin. Vui lòng đổi mật khẩu.");
    }
}

seedAdmin();


const PORT = Number(process.env.PORT ?? 3000);

const server = http.createServer(app);

initSocket(server);

server.listen(PORT, "0.0.0.0", () => {
    logger.info({ port: PORT }, "Server is running");
});
