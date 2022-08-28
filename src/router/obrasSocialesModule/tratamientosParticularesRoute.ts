import { Router } from "express";
import tratamientosParticularesController from "../../controllers/obrasSocialesModule/tratamientosParticularesController";

const router = Router()

router.get("/tratamientosParticulares/:idPersonaJuridica", tratamientosParticularesController.getTratamientosParticulares);
router.get("/tratamientosParticulares/getOne/:idPersonaJuridica/:idTratamientoParticular", tratamientosParticularesController.getTratamientoParticularById);
router.post("/tratamientosParticulares/agregar/:idPersonaJuridica", tratamientosParticularesController.agregarTratamientoParticular);
router.put("/tratamientosParticulares/editar/:idPersonaJuridica", tratamientosParticularesController.editarTratamientoParticular);
router.delete("/tratamientosParticulares/eliminar/:idPersonaJuridica/:idTratamientoParticular", tratamientosParticularesController.eliminarTratamientoParticular);

//module.exports = router

export default router;