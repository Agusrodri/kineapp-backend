import { Router } from "express";
import obrasSocialesController from "../../controllers/obrasSocialesModule/obrasSocialesController";

const router = Router()

router.get("/obrasSociales", obrasSocialesController.getObrasSociales);
router.get("/obrasSociales/planes/:idObraSocial", obrasSocialesController.getPlanesObraSocial);
router.post("/obrasSociales/crearObraSocial", obrasSocialesController.createObraSocial);
router.get("/obrasSociales/:idObraSocial", obrasSocialesController.getObraSocialById);
router.delete("/obrasSociales/eliminarObraSocial/:idObraSocial", obrasSocialesController.deleteObraSocialById);
router.put("/obrasSociales/editarObraSocial/:idObraSocial", obrasSocialesController.editObraSocialById);
router.post("/obrasSociales/agregarPlan/:idObraSocial", obrasSocialesController.agregarPlan);
router.post("/obrasSociales/agregarTratamientos/:idPlan/:idTratamientoGeneral", obrasSocialesController.agregarTratamientos);
router.get("/obrasSociales/getPlan/:idPlan", obrasSocialesController.getPlanById);


module.exports = router