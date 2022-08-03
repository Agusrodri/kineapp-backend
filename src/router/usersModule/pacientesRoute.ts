import { Router } from "express";
import pacientesController from "../../controllers/usersModule/pacientesController";

const router = Router()

router.post("/pacientes/crear", pacientesController.createUsuario);


module.exports = router