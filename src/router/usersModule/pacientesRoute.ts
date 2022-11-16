import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import pacientesController from "../../controllers/usersModule/pacientesController";

const router = Router()

router.post("/pacientes/crearUsuario", pacientesController.createUsuario);
router.post("/pacientes/crearPaciente/:idUsuario", pacientesController.createPaciente);
router.put("/pacientes/editarPaciente/:idUsuario", pacientesController.editarPaciente);
router.post("/pacientes/eliminarPaciente/:idUsuario", pacientesController.eliminarPaciente);
router.post("/crearPacienteConUsuario/:idPersonaJuridica", pacientesController.createPacienteConUsuario);
router.post("/agregarPacienteUsuario/:idPersonaJuridica/:idPaciente/:idUsuario", pacientesController.createPacienteFromUsuario);

//module.exports = router

export default router;