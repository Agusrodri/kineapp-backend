import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import pacientesInstitucionesController from "../../controllers/tratamientosModule/pacientesInstitucionesController";

const router = Router()

router.get("/pacientesInstitucion/:idPersonaJuridica", [validarJWT], pacientesInstitucionesController.getPacientesInstitucion);
router.get("/pacientesInstitucion/getPacienteById/:idPersonaJuridica/:idPaciente", [validarJWT], pacientesInstitucionesController.getPacienteById);
router.post("/pacientesInstitucion/agregarPaciente/:idPersonaJuridica", [validarJWT], pacientesInstitucionesController.agregarPaciente);
router.put("/pacientesInstitucion/editarPaciente/:idPersonaJuridica/:idPaciente", [validarJWT], pacientesInstitucionesController.editarPaciente);
router.delete("/pacientesInstitucion/eliminarPaciente/:idPersonaJuridica/:idPaciente", [validarJWT], pacientesInstitucionesController.eliminarPaciente);

export default router;