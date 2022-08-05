import { Router } from "express";
import { check } from "express-validator";
import profesionalesController from "../../controllers/usersModule/profesionalesController";

const router = Router()

router.get("/profesionales/:idPersonaJuridica", profesionalesController.getProfesionales);
router.get("/profesionales/:idPersonaJuridica/:idProfesional", profesionalesController.getProfesionalById);
router.post("/profesionales/crearSinUsuario/:idPersonaJuridica", profesionalesController.crearProfesionalSinUsuario);
router.put("/profesionales/validar/:idUsuario", profesionalesController.validarProfesional);
router.post("/profesionales/test/buscarUsuario/:idPersonaJuridica", profesionalesController.buscarUsuario);
router.post("/profesionales/crearConUsuario/:idUsuario/:idPersonaJuridica", profesionalesController.crearProfesionalConUsuario);
router.get("/tipoDNI/all", profesionalesController.getTiposDni);
router.put("/profesionales/editarFromPerfil/:idProfesional", profesionalesController.editarFromPerfil);
router.put("/profesionales/editarFromInstitucion/:idPersonaJuridica", profesionalesController.editarFromInstitucion);
router.delete("/profesionales/eliminar/:idPersonaJuridica/:idProfesional", profesionalesController.deleteProfesionalById);
router.put("/profesionales/editar/password/:idUsuario", profesionalesController.editarPassword);

module.exports = router
