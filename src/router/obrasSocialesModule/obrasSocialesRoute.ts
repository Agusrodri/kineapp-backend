import { Router } from "express";
import obrasSocialesController from "../../controllers/obrasSocialesModule/obrasSocialesController";

const router = Router()

router.get("/obrasSociales", obrasSocialesController.getObrasSociales);
router.get("/obrasSociales/planes/:idObraSocial", obrasSocialesController.getPlanesObraSocial);


module.exports = router