import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import consultasController from "../../controllers/turnosModule/consultasController";
import configuracionTurnosController from "../../controllers/turnosModule/configuracionTurnosController";

const router = Router();

router.post("/turnosDay/:idPersonaJuridica", consultasController.getTurnosDay);
router.post("/crearConsulta/:idTurno", consultasController.crearConsulta);
router.get("/confirmarTurno/:idTurno", consultasController.confirmarTurno);
router.get("/consultasPaciente/:idPaciente", consultasController.getConsultas);
router.get("/consulta/:idConsulta", consultasController.getConsultaById);
router.post("/calificarProfesional/:idConsulta", consultasController.calificarProfesional);

//configTurnos
router.get("/configuracion/:idPersonaJuridica", configuracionTurnosController.getConfigTurnos);
router.post("/setConfiguracion/:idPersonaJuridica", configuracionTurnosController.setConfiguracion);

export default router;