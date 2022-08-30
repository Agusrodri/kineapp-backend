import { Router } from "express";
import tratamientoPacienteController from "../../controllers/tratamientosModule/tratamientoPacienteController";

const router = Router()

router.post("/agregarTratamientoPaciente/:idPersonaJuridica/:idPaciente", tratamientoPacienteController.agregarTratamientoPaciente);
router.get("/getTratamientoPaciente/:idPersonaJuridica/:idPaciente/:idTratamientoPaciente", tratamientoPacienteController.getTratamientoAsignado);
router.get("/finalizarTratamientoPaciente/:idPersonaJuridica/:idPaciente/:idTratamientoPaciente", tratamientoPacienteController.finalizarTratamiento);
router.delete("/eliminarTratamientoPaciente/:idPersonaJuridica/:idPaciente/:idTratamientoPaciente", tratamientoPacienteController.eliminarTratamiento);


export default router;