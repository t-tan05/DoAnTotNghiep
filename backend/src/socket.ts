import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import redisClient from "#config/redis";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN } from "#config/jwt";
import { findUserById } from "#models/user.model";

let io: Server;

export function initSocket(server: HttpServer) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    io.use(async(socket, next) => {
        try {
            const token = socket.handshake.auth?.token;

            if(!token) {
                return next(new Error("UNAUTHORIZED"));
            }

            const isBlacklist = await redisClient.exists(`blacklist:${token}`);
            if(isBlacklist) {
                return next(new Error("UNAUTHORIZED"));
            }

            const decoded = jwt.verify(token, ACCESS_TOKEN as string, {
                algorithms: ['HS512'],
            }) as jwt.JwtPayload;

            if(!decoded.user_id) {
                return next(new Error("UNAUTHORIZED"));
            }

            const currentUser = await findUserById(decoded.user_id);

            if(!currentUser || currentUser.status === "LOCKED") {
                return next(new Error("UNAUTHORIZED"));
            }

            socket.data.user = {
                user_id: currentUser.user_id,
                email: currentUser.email,
                roles: currentUser.users_roles.map((role) => role.role_name),
            };

            next();
        }catch{
            next(new Error("UNAUTHORIZED"));
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected: ", socket.id);

        socket.on("join_admin", () => {
            const roles: string[] = socket.data.user?.roles || [];

            const canJoinAdmin = roles.includes("ADMIN") || roles.includes("EMPLOYEE");

            if(!canJoinAdmin) {
                socket.emit("socket:error", "Bạn không có quyền theo dõi đơn hàng.");
                return;
            }

            socket.join("admin");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    return io;
}

export function getIO() {
    if(!io) {
        throw new Error("Socket.IO chưa được khởi tạo.");
    }

    return io;
}