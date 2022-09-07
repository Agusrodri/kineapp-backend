import { Router } from "express";
import ejerciciosController from "../../controllers/tratamientosModule/ejerciciosController";

const router = Router()

router.get("/ejercicios/:idPersonaJuridica", ejerciciosController.getEjercicios);

//module.exports = router

export default router;