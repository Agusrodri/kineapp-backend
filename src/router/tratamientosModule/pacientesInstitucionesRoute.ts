import { Router } from "express";
import pacientesInstitucionesController from "../../controllers/tratamientosModule/pacientesInstitucionesController";

const router = Router()

router.get("/pacientesInstitucion/:idPersonaJuridica", pacientesInstitucionesController.getPacientesInstitucion);
router.get("/pacientesInstitucion/getPacienteById/:idPersonaJuridica/:idPaciente", pacientesInstitucionesController.getPacienteById);
router.post("/pacientesInstitucion/agregarPaciente/:idPersonaJuridica", pacientesInstitucionesController.agregarPaciente);
router.put("/pacientesInstitucion/editarPaciente/:idPersonaJuridica/:idPaciente", pacientesInstitucionesController.editarPaciente);
router.delete("/pacientesInstitucion/eliminarPaciente/:idPersonaJuridica/:idPaciente", pacientesInstitucionesController.eliminarPaciente);

export default router;