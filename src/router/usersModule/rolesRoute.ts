import { Router } from "express";
import { check } from "express-validator";
import dbValidators from "../../helpers/db-validators";
import rolesController from "../../controllers/usersModule/rolesController";
import validateRequest from "../../middlewares/validateRequest";
import refactors from "../../helpers/refactorParameter";
import validarJWT from "../../middlewares/validateJWT";

const router = Router()

router.get("/roles", rolesController.getRoles);

router.get("/roles/:id", rolesController.getRolById);

router.get("/rolesUsuario/:idUsuario", rolesController.getRolesUsuario)

router.put("/roles/editar/:id", [
    refactors.refactorNombreRol,
    dbValidators.isCurrentRol,
    dbValidators.existsRolWithName,
    validateRequest
], rolesController.updateRolById);

router.get("/roles/permisos/all", rolesController.getPermisos);

router.delete("/roles/eliminar/:id", rolesController.deleteRolById);

router.post("/roles/crear", [
    refactors.refactorNombreRol,
    dbValidators.runNextMiddleware,
    dbValidators.existsRolWithName,
    validarJWT,
    validateRequest
], rolesController.createRol);

//module.exports = router

export default router;