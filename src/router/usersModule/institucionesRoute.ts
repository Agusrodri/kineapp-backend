import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";

import institucionesController from "../../controllers/usersModule/institucionesController";

const router = Router()

router.get("/instituciones", institucionesController.getInstituciones);
router.get("/instituciones/:idPersonaJuridica", institucionesController.getInstitucionById);
router.post("/instituciones/crear", institucionesController.createInstitucion);
router.put("/instituciones/validar/:idUsuario", institucionesController.validarInstitucion);
router.put("/instituciones/editar/:idUsuario", institucionesController.updateInstitucionById);
router.delete("/instituciones/eliminar/:idPersonaJuridica", institucionesController.deleteInstitucionById);
router.get("/instituciones/habilitar/:idPersonaJuridica", institucionesController.habilitarInstitucion);
router.get("/instituciones/deshabilitar/:idPersonaJuridica", institucionesController.deshabilitarInstitucion);
router.put("/instituciones/editarFromPerfil/:idPersonaJuridica", institucionesController.editarInstitucionFromPerfil);


//module.exports = router

export default router;