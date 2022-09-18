import { Router } from "express";
import rutinaController from "../../controllers/tratamientosModule/rutinaController";

const router = Router()

router.post("/agregarRutina/:idTratamientoPaciente", rutinaController.createRutina);
router.get("/rutina/:idRutina", rutinaController.getRutinaById);
router.put("/editarRutina/:idRutina", rutinaController.editarRutina);
router.delete("/finalizarRutina/:idRutina", rutinaController.finalizarRutina);
router.delete("/eliminarRutina/:idRutina", rutinaController.eliminarRutina);
router.get("/getRutinasPaciente/:idTratamientoPaciente", rutinaController.getRutinasPaciente);

export default router;