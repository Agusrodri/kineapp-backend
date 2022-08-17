import { Router } from "express";
import tratamientosParticularesController from "../../controllers/obrasSocialesModule/tratamientosParticularesController";

const router = Router()

router.get("/tratamientosParticulares/:idPersonaJuridica", tratamientosParticularesController.getTratamientosParticulares);

module.exports = router