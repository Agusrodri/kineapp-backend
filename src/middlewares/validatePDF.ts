import { NextFunction, Request, Response } from "express";

const validatePDF = {

    validate: async (req: Request, res: Response, next: NextFunction) => {

        req.typeFile = "pdf"

        next();
    }
}

export default validatePDF


