import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import pacientesController from "../../controllers/usersModule/pacientesController";

const router = Router()

router.post("/pacientes/crearUsuario", [validarJWT], pacientesController.createUsuario);
router.post("/pacientes/crearPaciente/:idUsuario", [validarJWT], pacientesController.createPaciente);
router.put("/pacientes/editarPaciente/:idUsuario", [validarJWT], pacientesController.editarPaciente);
router.post("/pacientes/eliminarPaciente/:idUsuario", [validarJWT], pacientesController.eliminarPaciente);
router.post("/crearPacienteConUsuario/:idPersonaJuridica", [validarJWT], pacientesController.createPacienteConUsuario);
router.post("/agregarPacienteUsuario/:idPersonaJuridica/:idPaciente/:idUsuario", [validarJWT], pacientesController.createPacienteFromUsuario);

//module.exports = router

export default router;