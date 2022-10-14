import { Router } from "express";
import turnosController from "../../controllers/turnosModule/turnosController";

const router = Router();

router.post("/calcularMonto/:idPersonaJuridica/:idPaciente", turnosController.calcularMonto);
router.post("/guardarTurno/:idPersonaJuridica/:idPaciente", turnosController.guardarTurno);
router.get("/turnosPaciente/:idPaciente", turnosController.getTurnos);
router.get("/turnoById/:idTurno", turnosController.getTurnoById);
router.get("/verifyHorasTurno/:idTurno", turnosController.verificarHorasBeforeTurno);
router.put("/modificarTurno/:idTurno", turnosController.modificarTurno);
router.delete("/cancelarTurno/:idTurno", turnosController.cancelarTurno);
router.get("/turnosInstitucion/:idPersonaJuridica", turnosController.getAllTurnosInstitucion);
router.delete("/eliminarTurno/:idTurno", turnosController.eliminarTurnoFromInstitucion);


export default router;