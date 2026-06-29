import { Server } from "socket.io";
let io;
export function initSocket(server) {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("Socket connected: ", socket.id);
        socket.on("join_admin", () => {
            socket.join("admin");
        });
        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
    return io;
}
export function getIO() {
    if (!io) {
        throw new Error("Socket.IO chưa được khởi tạo.");
    }
    return io;
}
