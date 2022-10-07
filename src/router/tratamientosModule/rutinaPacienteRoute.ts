import { Router } from "express";
import rutinaPacienteController from "../../controllers/tratamientosModule/rutinaPacienteController";

const router = Router()

router.get("/tratamientosPaciente/:idPaciente", rutinaPacienteController.getTratamientosPaciente);
router.put("/checkEjercicios/:idRutina", rutinaPacienteController.setContadorCheck);
router.get("/tratamientoPaciente/:idTratamientoPaciente", rutinaPacienteController.getTratamiento);
router.post("/comentarRutina/:idRutina", rutinaPacienteController.comentarRutina);
router.get("/comentariosRutina/:idRutina", rutinaPacienteController.getComentariosRutina);
router.post("/setAlarmas/:idTratamientoPaciente", rutinaPacienteController.setAlarmas);

export default router;