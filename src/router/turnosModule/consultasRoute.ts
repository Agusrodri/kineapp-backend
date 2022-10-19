import { Router } from "express";
import consultasController from "../../controllers/turnosModule/consultasController";

const router = Router();

router.post("/turnosDay/:idPersonaJuridica", consultasController.getTurnosDay);

export default router;