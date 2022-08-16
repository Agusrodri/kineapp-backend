import { Router } from "express";
import conveniosController from "../../controllers/obrasSocialesModule/conveniosController";

const router = Router()

router.get("/convenios/:idPersonaJuridica", conveniosController.getConvenios);
router.get("/convenios/:idPersonaJuridica/:idConvenio", conveniosController.getConvenioById);
router.delete("/convenio/eliminar/:idPersonaJuridica/:idConvenio", conveniosController.bajaConvenio);
router.post("/convenios/agregar/:idPersonaJuridica", conveniosController.agregarConvenio);
//obtener todos los tratamientos que cubre esa obra social
router.get("/tratamientosObraSocialConvenio/:idObraSocial/:idPersonaJuridica", conveniosController.getTratamientosConvenio);

module.exports = router