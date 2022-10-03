import { Router } from "express";
import { check } from "express-validator";

import reportesController from "../../controllers/reportesModule/reportesController";

const router = Router();

router.post("/generarReportes/:idPersonaJuridica", reportesController.generarReportes);

export default router;