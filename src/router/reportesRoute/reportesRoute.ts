import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";

import reportesController from "../../controllers/reportesModule/reportesController";

const router = Router();

router.post("/generarReportes/:idPersonaJuridica", [validarJWT], reportesController.generarReportes);

export default router;