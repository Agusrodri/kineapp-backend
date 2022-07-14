import { Router } from "express";
import { check } from "express-validator";
import rolesController from "../../controllers/usersModule/rolesController";

const router = Router()


router.get("/roles", rolesController.getRoles);
router.get("/roles/:id", rolesController.getRolById);
//router.put("/roles/editar/:id", )
router.get("/roles/permisos/all", rolesController.getPermisos);

module.exports = router