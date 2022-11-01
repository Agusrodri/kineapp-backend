import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import obrasSocialesController from "../../controllers/obrasSocialesModule/obrasSocialesController";

const router = Router()

router.get("/obrasSociales", obrasSocialesController.getObrasSociales);
router.get("/obrasSociales/planes/:idObraSocial", obrasSocialesController.getPlanesObraSocial);
router.post("/obrasSociales/crearObraSocial", [validarJWT], obrasSocialesController.createObraSocial);
router.get("/obrasSociales/:idObraSocial", [validarJWT], obrasSocialesController.getObraSocialById);
router.delete("/obrasSociales/eliminarObraSocial/:idObraSocial", [validarJWT], obrasSocialesController.deleteObraSocialById);
router.put("/obrasSociales/editarObraSocial/:idObraSocial", [validarJWT], obrasSocialesController.editObraSocialById);
router.post("/obrasSociales/agregarPlan/:idObraSocial", [validarJWT], obrasSocialesController.agregarPlan);
router.post("/obrasSociales/agregarTratamientos/:idPlan", [validarJWT], obrasSocialesController.agregarTratamientos);
router.get("/obrasSociales/getPlan/:idPlan", [validarJWT], obrasSocialesController.getPlanById);
router.put("/obrasSociales/editarPlan/:idPlan", [validarJWT], obrasSocialesController.editarPlan);
router.delete("/obrasSociales/eliminarPlan/:idPlan", [validarJWT], obrasSocialesController.eliminarPlan);

//module.exports = router

export default router;