import { Router } from "express";
import tratamientosGeneralesController from "../../controllers/obrasSocialesModule/tratamientosGeneralesController";

const router = Router()

router.get("/tratamientosGenerales", tratamientosGeneralesController.getTratamientosGenerales);
router.get("/tratamientosGenerales/:idTratamientoGeneral", tratamientosGeneralesController.getTratamientoGeneralById);
router.post("/tratamientosGenerales/agregarTratamiento", tratamientosGeneralesController.agregarTratamientoGeneral);
router.put("/tratamientosGenerales/editarTratamiento/:idTratamientoGeneral", tratamientosGeneralesController.editarTratamientoGeneral);
router.delete("/tratamientosGenerales/eliminarTratamiento/:idTratamientoGeneral", tratamientosGeneralesController.eliminarTratamientoGeneral);

module.exports = router