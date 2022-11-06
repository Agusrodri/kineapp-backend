import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import consultasController from "../../controllers/turnosModule/consultasController";
import configuracionTurnosController from "../../controllers/turnosModule/configuracionTurnosController";

const router = Router();

router.post("/turnosDay/:idPersonaJuridica", [validarJWT], consultasController.getTurnosDay);
router.post("/crearConsulta/:idTurno", [validarJWT], consultasController.crearConsulta);
router.get("/confirmarTurno/:idTurno", [validarJWT], consultasController.confirmarTurno);
router.get("/consultasPaciente/:idPaciente", [validarJWT], consultasController.getConsultas);
router.get("/consulta/:idConsulta", [validarJWT], consultasController.getConsultaById);
router.post("/calificarProfesional/:idConsulta", [validarJWT], consultasController.calificarProfesional);

//configTurnos
router.get("/configuracion/:idPersonaJuridica", [validarJWT], configuracionTurnosController.getConfigTurnos);
router.post("/setConfiguracion/:idPersonaJuridica", [validarJWT], configuracionTurnosController.setConfiguracion);

export default router;