import { Router } from "express";
import { check } from "express-validator";

import institucionesController from "../../controllers/usersModule/institucionesController";

const router = Router()

router.get("/instituciones", institucionesController.getInstituciones);
router.get("/instituciones/:idPersonaJuridica", institucionesController.getInstitucionById);
router.post("/instituciones/crear", institucionesController.createInstitucion);
router.put("/instituciones/validar/:idUsuario", institucionesController.validarInstitucion);


module.exports = router