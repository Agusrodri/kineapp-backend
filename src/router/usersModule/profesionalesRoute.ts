import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";
import profesionalesController from "../../controllers/usersModule/profesionalesController";

const router = Router()

router.get("/profesionales/:idPersonaJuridica", [validarJWT], profesionalesController.getProfesionales);
router.get("/profesionales/:idPersonaJuridica/:idProfesional", [validarJWT], profesionalesController.getProfesionalById);
router.post("/profesionales/crearSinUsuario/:idPersonaJuridica", [validarJWT], profesionalesController.crearProfesionalSinUsuario);
router.put("/profesionales/validar/:idUsuario", profesionalesController.validarProfesional);
router.post("/profesionales/test/buscarUsuario/:idPersonaJuridica", [validarJWT], profesionalesController.buscarUsuario);
router.post("/profesionales/crearConUsuario/:idUsuario/:idPersonaJuridica", [validarJWT], profesionalesController.crearProfesionalConUsuario);
router.get("/tipoDNI/all", profesionalesController.getTiposDni);
router.put("/profesionales/editarFromPerfil/:idProfesional", [validarJWT], profesionalesController.editarFromPerfil);
router.put("/profesionales/editarFromInstitucion/:idPersonaJuridica", [validarJWT], profesionalesController.editarFromInstitucion);
router.delete("/profesionales/eliminar/:idPersonaJuridica/:idProfesional", [validarJWT], profesionalesController.deleteProfesionalById);
router.put("/profesionales/editar/password/:idUsuario", [validarJWT], profesionalesController.editarPassword);

//module.exports = router

export default router;
