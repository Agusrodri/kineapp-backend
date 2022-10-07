import { Router } from "express";
import { Request, Response, NextFunction } from "express";
import db from "../../database/connection";

const router = Router();

//Define routes Here
router.get('/health', (req: Request, res: Response, next: NextFunction) => {
    res.send('Service status ok');
});

router.get('/closeDB', (req: Request, res: Response, next: NextFunction) => {
    db.close();
    res.send("DB connection closed")
})

export default router;