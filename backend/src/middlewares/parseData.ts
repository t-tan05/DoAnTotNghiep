import { NextFunction, Request, Response } from "express";

export const parseData = (req:Request, res:Response, next:NextFunction) => {
    if(typeof req.body.data === "string"){
        req.body = JSON.parse(req.body.data);
    }

    next();
}