import { Router } from "express";
import validarJWT from "../../middlewares/validateJWT";
import comentarioPacienteController from "../../controllers/tratamientosModule/comentarioPacienteController";

const router = Router()

router.get("/institucionesPaciente/:idPaciente", [validarJWT], comentarioPacienteController.getInstitucionesPaciente);
router.get("/comentariosInstitucion/:idPersonaJuridica/:idPaciente", [validarJWT], comentarioPacienteController.getComentariosInstitucion);
router.post("/agregarComentario/:idPersonaJuridica/:idPaciente", [validarJWT], comentarioPacienteController.agregarComentario);
router.get("/comentariosFromInstitucionView/:idPersonaJuridica", [validarJWT], comentarioPacienteController.getComentariosFromInstitucionView);

export default router;