import { Router } from "express";
import pacientesController from "../../controllers/usersModule/pacientesController";

const router = Router()

router.post("/pacientes/crearUsuario", pacientesController.createUsuario);
router.post("/pacientes/crearPaciente/:idUsuario", pacientesController.createPaciente);

router.put("/pacientes/editarPaciente/:idUsuario", pacientesController.editarPaciente);
router.delete("/pacientes/eliminarPaciente/:idUsuario", pacientesController.eliminarPaciente);

module.exports = router