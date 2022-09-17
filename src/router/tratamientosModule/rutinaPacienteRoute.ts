import { Router } from "express";
import rutinaPacienteController from "../../controllers/tratamientosModule/rutinaPacienteController";

const router = Router()

router.get("/tratamientosPaciente/:idPaciente", rutinaPacienteController.getTratamientosPaciente);
router.put("/checkEjercicios/:idRutina", rutinaPacienteController.setContadorCheck);

export default router;