import { Router } from "express";
import turnosController from "../../controllers/turnosModule/turnosController";

const router = Router();

router.post("/calcularMonto/:idPersonaJuridica/:idPaciente", turnosController.calcularMonto);
router.post("/guardarTurno/:idPersonaJuridica/:idPaciente", turnosController.guardarTurno);
router.get("/turnosPaciente/:idPersonaJuridica/:idPaciente", turnosController.getTurnos);
router.get("/turnoById/:idTurno", turnosController.getTurnoById);

export default router;