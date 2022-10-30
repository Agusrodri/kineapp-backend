import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import rutinaPacienteController from "../../controllers/tratamientosModule/rutinaPacienteController";

const router = Router()

router.get("/tratamientosPaciente/:idPaciente", [validarJWT], rutinaPacienteController.getTratamientosPaciente);
router.put("/checkEjercicios/:idRutina", [validarJWT], rutinaPacienteController.setContadorCheck);
router.get("/tratamientoPaciente/:idTratamientoPaciente", [validarJWT], rutinaPacienteController.getTratamiento);
router.post("/comentarRutina/:idRutina", [validarJWT], rutinaPacienteController.comentarRutina);
router.get("/comentariosRutina/:idRutina", [validarJWT], rutinaPacienteController.getComentariosRutina);
router.post("/setAlarmas/:idTratamientoPaciente", [validarJWT], rutinaPacienteController.setAlarmas);
router.get("/getAlarmas/:idTratamientoPaciente", [validarJWT], rutinaPacienteController.getAlarmas);
router.put("/modificarAlarmas/:idTratamientoPaciente", [validarJWT], rutinaPacienteController.modificarAlarmas);

export default router;