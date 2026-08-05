import express from "express";
import cors from "cors";
import helmet from "helmet";
import redisClient from "#config/redis";
import { limiter } from "#config/rateLimit";
import { globalErrorHandler } from "#middlewares/ErrorHandler";
import cookieParser from "cookie-parser";
import { requestLogger } from "#middlewares/requestLogger";

//Router
import authRoute from "#routes/auth.route";
import roleRoute from "#routes/role.route";
import userRoute from "#routes/user.route";
import categoryRoute from "#routes/category.route";
import brandRoute from "#routes/brand.route";
import productRoute from "#routes/product.route";
import productLineRoute from "#routes/productLine.route";
import productAttributeRoute from "#routes/productAttribute.route";
import attributeValueRoute from "#routes/attributeValue.route";
import productVariantRoute from "#routes/productVariant.route";
import productImageRoute from "#routes/productImage.route";
import addressRoute from "#routes/address.route";
import promotionRoute from "#routes/promotion.route";
import blogRoute from "#routes/blog.route";
import externalNewsRoute from "#routes/externalNews.route";
import cartRoute from "#routes/cart.route";
import orderRoute from "#routes/order.route";
import reviewRoute from "#routes/review.route";
import wishlistRoute from "#routes/wishlist.route";
import warrantyRoute from "#routes/warranty.route";
import cmsRoute from "#routes/cms.route";
import dashboardRoute from "#routes/dashboard.route";
import aiRoute from "#routes/ai.route";
import ghnRoute from "#routes/ghn.route";
import webhookRoute from "#routes/webhook.route";

const app = express();

app.use(requestLogger);
app.use(helmet());

app.use(cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : true,
    credentials: true,
}));

app.use(limiter);

//convert bigint sang string
(BigInt.prototype as any).toJSON = function(){
    return this.toString();
};

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/roles", roleRoute);
app.use("/api/users", userRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/brands", brandRoute);
app.use("/api/products", productRoute);
app.use("/api/product-lines", productLineRoute);
app.use("/api/product-attributes", productAttributeRoute);
app.use("/api/attribute-values", attributeValueRoute);
app.use("/api/product-variants", productVariantRoute);
app.use("/api/product-images", productImageRoute);
app.use("/api/addresses", addressRoute);
app.use("/api/promotions", promotionRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/external-news", externalNewsRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/wishlists", wishlistRoute);
app.use("/api/warranties", warrantyRoute);
app.use("/api/cms", cmsRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/ai", aiRoute);
app.use("/api/ghn", ghnRoute);
app.use("/api/webhooks", webhookRoute);

app.use(globalErrorHandler);

export default app;
