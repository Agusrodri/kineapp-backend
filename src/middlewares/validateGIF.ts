import { NextFunction, Request, Response } from "express";

const validateGIF = {

    validate: async (req: Request, res: Response, next: NextFunction) => {

        req.typeFile = "gif"

        next();
    }
}

export default validateGIF