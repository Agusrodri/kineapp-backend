import { Router } from "express";
import { check } from "express-validator";
import profesionalesController from "../../controllers/usersModule/profesionalesController";

const router = Router()

router.get("/profesionales/:idPersonaJuridica", profesionalesController.getProfesionales);

router.get("/profesionales/:idPersonaJuridica/:idProfesional", profesionalesController.getProfesionalById);

router.post("/profesionales/crearSinUsuario/:idPersonaJuridica", profesionalesController.crearProfesionalSinUsuario);

router.put("/profesionales/validar/:idUsuario", profesionalesController.validarProfesional);

router.get("/profesionales/test/buscarUsuario/:idPersonaJuridica", profesionalesController.buscarUsuario);

router.post("/profesionales/crearConUsuario/:idUsuario/:idPersonaJuridica", profesionalesController.crearProfesionalConUsuario);

router.get("/tipoDNI/all", profesionalesController.getTiposDni)

module.exports = router