import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import tratamientosGeneralesController from "../../controllers/obrasSocialesModule/tratamientosGeneralesController";

const router = Router()

router.get("/tratamientosGenerales", [validarJWT], tratamientosGeneralesController.getTratamientosGenerales);
router.get("/tratamientosGenerales/:idTratamientoGeneral", [validarJWT], tratamientosGeneralesController.getTratamientoGeneralById);
router.post("/tratamientosGenerales/agregarTratamiento", [validarJWT], tratamientosGeneralesController.agregarTratamientoGeneral);
router.put("/tratamientosGenerales/editarTratamiento/:idTratamientoGeneral", [validarJWT], tratamientosGeneralesController.editarTratamientoGeneral);
router.delete("/tratamientosGenerales/eliminarTratamiento/:idTratamientoGeneral", [validarJWT], tratamientosGeneralesController.eliminarTratamientoGeneral);

//module.exports = router

export default router;