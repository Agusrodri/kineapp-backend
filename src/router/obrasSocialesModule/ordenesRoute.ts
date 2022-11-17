import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import ordenesController from "../../controllers/obrasSocialesModule/ordenesController";

const router = Router()

router.post("/ordenes/:idPersonaJuridica", ordenesController.generarOrdenes);

export default router;