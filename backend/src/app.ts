import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import redisClient from "#config/redis";
import { limiter } from "#config/rateLimit";
import { globalErrorHandler } from "#middlewares/ErrorHandler";

//Route
import authRoute from "#routes/auth.route";
import roleRoute from "#routes/role.route";
import userRoute from "#routes/user.route";

const app = express();

app.use(morgan("dev"));
app.use(helmet());

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(limiter);

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/roles", roleRoute);
app.use("/api/users", userRoute);

app.use(globalErrorHandler);

export default app;
