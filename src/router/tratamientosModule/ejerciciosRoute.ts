import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import ejerciciosController from "../../controllers/tratamientosModule/ejerciciosController";

const router = Router()

router.get("/ejercicios/:idPersonaJuridica", [validarJWT], ejerciciosController.getEjercicios);
router.get("/ejercicios/:idPersonaJuridica/:idEjercicio", [validarJWT], ejerciciosController.getEjercicioById);
router.post("/ejercicios/agregar/:idPersonaJuridica", [validarJWT], ejerciciosController.agregarEjercicio);
router.put("/ejercicios/editar/:idPersonaJuridica/:idEjercicio", [validarJWT], ejerciciosController.editarEjercicioById);
router.delete("/ejercicios/eliminarGIF/:idPersonaJuridica/:idEjercicio", [validarJWT], ejerciciosController.eliminarGIF);
router.delete("/ejercicios/eliminar/:idPersonaJuridica/:idEjercicio", [validarJWT], ejerciciosController.eliminarEjercicio);

export default router;