import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import tratamientosParticularesController from "../../controllers/obrasSocialesModule/tratamientosParticularesController";

const router = Router()

router.get("/tratamientosParticulares/:idPersonaJuridica", [validarJWT], tratamientosParticularesController.getTratamientosParticulares);
router.get("/tratamientosParticulares/getOne/:idPersonaJuridica/:idTratamientoParticular", [validarJWT], tratamientosParticularesController.getTratamientoParticularById);
router.post("/tratamientosParticulares/agregar/:idPersonaJuridica", [validarJWT], tratamientosParticularesController.agregarTratamientoParticular);
router.put("/tratamientosParticulares/editar/:idPersonaJuridica", [validarJWT], tratamientosParticularesController.editarTratamientoParticular);
router.delete("/tratamientosParticulares/eliminar/:idPersonaJuridica/:idTratamientoParticular", [validarJWT], tratamientosParticularesController.eliminarTratamientoParticular);

//module.exports = router

export default router;