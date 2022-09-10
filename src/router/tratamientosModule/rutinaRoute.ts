import { Router } from "express";
import rutinaController from "../../controllers/tratamientosModule/rutinaController";

const router = Router()

router.post("/agregarRutina/:idTratamientoPaciente", rutinaController.createRutina)

export default router;