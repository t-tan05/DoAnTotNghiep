import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { limiter } from "#config/rateLimit";
import { globalErrorHandler } from "#middlewares/ErrorHandler";
//Router
import authRoute from "#routes/auth.route";
import roleRoute from "#routes/role.route";
import userRoute from "#routes/user.route";
import categoryRoute from "#routes/category.route";
import brandRoute from "#routes/brand.route";
import productRoute from "#routes/product.route";
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
app.use("/api/categories", categoryRoute);
app.use("/api/brands", brandRoute);
app.use("/api/products/", productRoute);
app.use(globalErrorHandler);
export default app;
