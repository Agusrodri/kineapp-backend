import { Router } from "express";
import consultasController from "../../controllers/turnosModule/consultasController";

const router = Router();

router.post("/turnosDay/:idPersonaJuridica", consultasController.getTurnosDay);
router.post("/crearConsulta/:idTurno", consultasController.crearConsulta);
router.get("/confirmarTurno/:idTurno", consultasController.confirmarTurno);
router.get("/consultasPaciente/:idPaciente", consultasController.getConsultas);
router.get("/consulta/:idConsulta", consultasController.getConsultaById);
router.post("/calificarProfesional/:idConsulta", consultasController.calificarProfesional);

export default router;