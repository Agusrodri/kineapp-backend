import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";

import institucionesController from "../../controllers/usersModule/institucionesController";

const router = Router()

router.get("/instituciones", [validarJWT], institucionesController.getInstituciones);
router.get("/instituciones/:idPersonaJuridica", [validarJWT], institucionesController.getInstitucionById);
router.post("/instituciones/crear", [validarJWT], institucionesController.createInstitucion);
router.put("/instituciones/validar/:idUsuario", [validarJWT], institucionesController.validarInstitucion);
router.put("/instituciones/editar/:idUsuario", [validarJWT], institucionesController.updateInstitucionById);
router.delete("/instituciones/eliminar/:idPersonaJuridica", [validarJWT], institucionesController.deleteInstitucionById);
router.get("/instituciones/habilitar/:idPersonaJuridica", [validarJWT], institucionesController.habilitarInstitucion);
router.get("/instituciones/deshabilitar/:idPersonaJuridica", [validarJWT], institucionesController.deshabilitarInstitucion);
router.put("/instituciones/editarFromPerfil/:idPersonaJuridica", [validarJWT], institucionesController.editarInstitucionFromPerfil);


//module.exports = router

export default router;