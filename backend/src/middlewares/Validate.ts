import AppError from "#utils/AppError";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const Validate = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            return res.status(400).json({
                status: "fail",
                message: "Validation Error",
                errors: error.details.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            });
        }

        req.body = value;
        next();
    }
}
