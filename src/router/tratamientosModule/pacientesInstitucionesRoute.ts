import { Router } from "express";
import pacientesInstitucionesController from "../../controllers/tratamientosModule/pacientesInstitucionesController";

const router = Router()

router.get("/pacientesInstitucion/:idPersonaJuridica", pacientesInstitucionesController.getPacientesInstitucion)

//module.exports = router

export default router;