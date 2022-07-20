import { Router } from "express";
import { check } from "express-validator";
import dbValidators from "../../helpers/db-validators";
import rolesInternosController from "../../controllers/usersModule/rolesInternosController";
import validateRequest from "../../middlewares/validateRequest";
import refactors from "../../helpers/refactorParameter";

const router = Router()

router.get("/rolesinternos/:idPersonaJuridica", rolesInternosController.getRolesInternos);

router.post("/rolesinternos/crear/:idPersonaJuridica", [
    refactors.refactorNombreRol,
    dbValidators.runNextMiddleware,
    dbValidators.existsRolInternoWithName,
    validateRequest
], rolesInternosController.createRolInterno);

router.delete("/rolesinternos/eliminar/:idPersonaJuridica/:idRolInterno", rolesInternosController.deleteRolInternoById)

module.exports = router