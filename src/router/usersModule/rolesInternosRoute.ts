import { Router } from "express";
import { check } from "express-validator";
import dbValidators from "../../helpers/db-validators";
import rolesInternosController from "../../controllers/usersModule/rolesInternosController";
import validateRequest from "../../middlewares/validateRequest";
import refactors from "../../helpers/refactorParameter";
import validarJWT from "../../middlewares/validateJWT";

const router = Router()

router.get("/rolesinternos/:idPersonaJuridica", [validarJWT], rolesInternosController.getRolesInternos);

router.get("/rolesinternos/:idPersonaJuridica/:idRolInterno", [validarJWT], rolesInternosController.getRolInternoById);

router.get("/rolesinternos/permisosInternos/get/all", [validarJWT], rolesInternosController.getPermisosInternos);

router.post("/rolesinternos/crear/:idPersonaJuridica", [
    refactors.refactorNombreRol,
    dbValidators.runNextMiddleware,
    dbValidators.existsRolInternoWithName,
    validarJWT,
    validateRequest
], rolesInternosController.createRolInterno);

router.delete("/rolesinternos/eliminar/:idPersonaJuridica/:idRolInterno", [validarJWT], rolesInternosController.deleteRolInternoById);

router.put("/rolesinternos/editar/:idPersonaJuridica/:idRolInterno", [
    refactors.refactorNombreRol,
    dbValidators.isCurrentRolInterno,
    dbValidators.existsRolInternoWithName,
    validarJWT,
    validateRequest
], rolesInternosController.updateRolInternoById);

//module.exports = router

export default router;