import {createClient} from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URI,
});

redisClient.on("error", (err) => {
    console.log("Redis Error", err);
});

await redisClient.connect();

console.log("Redis connected");

export default redisClient;