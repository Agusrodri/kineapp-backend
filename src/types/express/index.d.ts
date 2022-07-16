import express from "express";

declare global {
    namespace Express {
        interface Request {
            shouldRunNextMiddleware?: Record<boolean, any>
        }
    }
}