import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import tratamientoPacienteController from "../../controllers/tratamientosModule/tratamientoPacienteController";

const router = Router()

router.post("/agregarTratamientoPaciente/:idPersonaJuridica/:idPaciente", [validarJWT], tratamientoPacienteController.agregarTratamientoPaciente);
router.get("/getTratamientoPaciente/:idPersonaJuridica/:idPaciente/:idTratamientoPaciente", [validarJWT], tratamientoPacienteController.getTratamientoAsignado);
router.get("/getTratamientosPaciente/:idPersonaJuridica/:idPaciente", [validarJWT], tratamientoPacienteController.getAllTratamientos);
router.get("/finalizarTratamientoPaciente/:idPersonaJuridica/:idPaciente/:idTratamientoPaciente", [validarJWT], tratamientoPacienteController.finalizarTratamiento);
router.delete("/eliminarTratamientoPaciente/:idPersonaJuridica/:idPaciente/:idTratamientoPaciente", [validarJWT], tratamientoPacienteController.eliminarTratamiento);

export default router;