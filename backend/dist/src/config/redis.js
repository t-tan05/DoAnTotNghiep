import { createClient } from "redis";
import logger from "#config/logger";
const redisClient = createClient({
    url: process.env.REDIS_URI,
});
redisClient.on("error", (err) => {
    logger.error({ err }, "Redis error");
});
await redisClient.connect();
logger.info("Redis connected");
export default redisClient;
