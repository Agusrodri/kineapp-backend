import { Router } from "express";
import { check } from "express-validator";
import dbValidators from "../../helpers/db-validators";
import rolesInternosController from "../../controllers/usersModule/rolesInternosController";
import validateRequest from "../../middlewares/validateRequest";
import refactors from "../../helpers/refactorParameter";

const router = Router()

router.get("/rolesinternos/:idPersonaJuridica", rolesInternosController.getRolesInternos);

router.get("/rolesinternos/:idPersonaJuridica/:idRolInterno", rolesInternosController.getRolInternoById);

router.get("/rolesinternos/permisosInternos/get/all", rolesInternosController.getPermisosInternos);

router.post("/rolesinternos/crear/:idPersonaJuridica", [
    refactors.refactorNombreRol,
    dbValidators.runNextMiddleware,
    dbValidators.existsRolInternoWithName,
    validateRequest
], rolesInternosController.createRolInterno);

router.delete("/rolesinternos/eliminar/:idPersonaJuridica/:idRolInterno", rolesInternosController.deleteRolInternoById);

router.put("/rolesinternos/editar/:idPersonaJuridica/:idRolInterno", [
    refactors.refactorNombreRol,
    dbValidators.isCurrentRolInterno,
    dbValidators.existsRolInternoWithName,
    validateRequest
], rolesInternosController.updateRolInternoById);

module.exports = router