import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import turnosController from "../../controllers/turnosModule/turnosController";

const router = Router();

router.post("/calcularMonto/:idPersonaJuridica/:idPaciente", [validarJWT], turnosController.calcularMonto);
router.post("/guardarTurno/:idPersonaJuridica/:idPaciente", [validarJWT], turnosController.guardarTurno);
router.get("/turnosPaciente/:idPaciente", [validarJWT], turnosController.getTurnos);
router.get("/turnoById/:idTurno", [validarJWT], turnosController.getTurnoById);
router.get("/verifyHorasTurno/:idTurno", [validarJWT], turnosController.verificarHorasBeforeTurno);
router.put("/modificarTurno/:idTurno", [validarJWT], turnosController.modificarTurno);
router.delete("/cancelarTurno/:idTurno", [validarJWT], turnosController.cancelarTurno);
router.get("/turnosInstitucion/:idPersonaJuridica", [validarJWT], turnosController.getAllTurnosInstitucion);
router.delete("/eliminarTurno/:idTurno", [validarJWT], turnosController.eliminarTurnoFromInstitucion);
router.post("/horariosDisponibles/:idPersonaJuridica", [validarJWT], turnosController.getHorariosInstitucion);
router.post("/agregarTurnoInstitucion/:idPersonaJuridica", [validarJWT], turnosController.agregarTurnoInstitucion);


export default router;