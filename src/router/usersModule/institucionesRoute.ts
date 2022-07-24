import { Router } from "express";
import { check } from "express-validator";
import institucionesController from "../../controllers/usersModule/institucionesController";

const router = Router()

router.get("/instituciones", institucionesController.getInstituciones);
router.get("/instituciones/:idPersonaJuridica", institucionesController.getInstitucionById);

module.exports = router