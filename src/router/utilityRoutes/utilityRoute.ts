import { Router } from "express";
import { Request, Response, NextFunction } from "express";

const router = Router();

//Define routes Here
router.get('/health', (req: Request, res: Response, next: NextFunction) => {
    res.send('Service status ok');
});


export default router;