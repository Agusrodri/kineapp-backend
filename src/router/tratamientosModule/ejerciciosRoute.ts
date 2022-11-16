import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import ejerciciosController from "../../controllers/tratamientosModule/ejerciciosController";

const router = Router()

router.get("/ejercicios/:idPersonaJuridica", ejerciciosController.getEjercicios);
router.get("/ejercicios/:idPersonaJuridica/:idEjercicio", ejerciciosController.getEjercicioById);
router.post("/ejercicios/agregar/:idPersonaJuridica", ejerciciosController.agregarEjercicio);
router.put("/ejercicios/editar/:idPersonaJuridica/:idEjercicio", ejerciciosController.editarEjercicioById);
router.delete("/ejercicios/eliminarGIF/:idPersonaJuridica/:idEjercicio", ejerciciosController.eliminarGIF);
router.delete("/ejercicios/eliminar/:idPersonaJuridica/:idEjercicio", ejerciciosController.eliminarEjercicio);

export default router;