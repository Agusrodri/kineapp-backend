import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import consultasController from "../../controllers/turnosModule/consultasController";

const router = Router();

router.post("/turnosDay/:idPersonaJuridica", [validarJWT], consultasController.getTurnosDay);
router.post("/crearConsulta/:idTurno", [validarJWT], consultasController.crearConsulta);
router.get("/confirmarTurno/:idTurno", [validarJWT], consultasController.confirmarTurno);
router.get("/consultasPaciente/:idPaciente", [validarJWT], consultasController.getConsultas);
router.get("/consulta/:idConsulta", [validarJWT], consultasController.getConsultaById);
router.post("/calificarProfesional/:idConsulta", [validarJWT], consultasController.calificarProfesional);

export default router;