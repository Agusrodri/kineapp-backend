import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import conveniosController from "../../controllers/obrasSocialesModule/conveniosController";

const router = Router()

router.get("/convenios/:idPersonaJuridica", [validarJWT], conveniosController.getConvenios);
router.get("/convenios/:idPersonaJuridica/:idConvenio", [validarJWT], conveniosController.getConvenioById);
router.delete("/convenios/eliminar/:idPersonaJuridica/:idConvenio", [validarJWT], conveniosController.bajaConvenio);
router.post("/convenios/agregar/:idPersonaJuridica", [validarJWT], conveniosController.agregarConvenio);
//obtener todos los tratamientos que cubre esa obra social
router.get("/tratamientosObraSocialConvenio/:idObraSocial/:idPersonaJuridica", [validarJWT], conveniosController.getTratamientosConvenio);
router.put("/convenios/editar/:idPersonaJuridica", [validarJWT], conveniosController.editarConvenio);

//module.exports = router

export default router;