import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import comentarioPacienteController from "../../controllers/tratamientosModule/comentarioPacienteController";

const router = Router()

router.get("/institucionesPaciente/:idPaciente", comentarioPacienteController.getInstitucionesPaciente);
router.get("/comentariosInstitucion/:idPersonaJuridica/:idPaciente", comentarioPacienteController.getComentariosInstitucion);
router.post("/agregarComentario/:idPersonaJuridica/:idPaciente", comentarioPacienteController.agregarComentario);
router.get("/comentariosFromInstitucionView/:idPersonaJuridica", comentarioPacienteController.getComentariosFromInstitucionView);

export default router;