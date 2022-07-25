import { Router } from "express";
import { check } from "express-validator";

import institucionesController from "../../controllers/usersModule/institucionesController";

const router = Router()



router.get("/instituciones", institucionesController.getInstituciones);
router.get("/instituciones/:idPersonaJuridica", institucionesController.getInstitucionById);

/* router.post("/instituciones/files/upload", [
    upload.single("myFile")
], institucionesController.file) */

module.exports = router