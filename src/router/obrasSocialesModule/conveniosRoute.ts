import { Router } from "express";
import conveniosController from "../../controllers/obrasSocialesModule/conveniosController";

const router = Router()

router.get("/convenios/:idPersonaJuridica", conveniosController.getConvenios);
router.post("/convenios/agregar/:idPersonaJuridica", conveniosController.agregarConvenio);
//obtener todos los tratamientos que cubre esa obra social
router.get("/tratamientosObraSocialConvenio/:idObraSocial", conveniosController.getTratamientosConvenio);

module.exports = router