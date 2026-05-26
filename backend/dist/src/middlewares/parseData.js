export const parseData = (req, res, next) => {
    if (typeof req.body.data === "string") {
        req.body = JSON.parse(req.body.data);
    }
    next();
};
