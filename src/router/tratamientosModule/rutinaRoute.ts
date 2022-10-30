import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import rutinaController from "../../controllers/tratamientosModule/rutinaController";

const router = Router()

router.post("/agregarRutina/:idTratamientoPaciente", [validarJWT], rutinaController.createRutina);
router.get("/rutina/:idRutina", [validarJWT], rutinaController.getRutinaById);
router.put("/editarRutina/:idRutina", [validarJWT], rutinaController.editarRutina);
router.delete("/finalizarRutina/:idRutina", [validarJWT], rutinaController.finalizarRutina);
router.delete("/eliminarRutina/:idRutina", [validarJWT], rutinaController.eliminarRutina);
router.get("/getRutinasPaciente/:idTratamientoPaciente", [validarJWT], rutinaController.getRutinasPaciente);

export default router;