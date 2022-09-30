import { Router } from "express";
import comentarioPacienteController from "../../controllers/tratamientosModule/comentarioPacienteController";

const router = Router()

router.get("/institucionesPaciente/:idPaciente", comentarioPacienteController.getInstitucionesPaciente);
router.get("/comentariosInstitucion/:idPersonaJuridica/:idPaciente", comentarioPacienteController.getComentariosInstitucion);
router.post("/agregarComentario/:idPersonaJuridica/:idPaciente", comentarioPacienteController.agregarComentario);


export default router;