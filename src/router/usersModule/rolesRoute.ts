import { Router } from "express";
import { check } from "express-validator";
import rolesController from "../../controllers/usersModule/rolesController";

const router = Router()


router.get("/roles", rolesController.getRoles);

module.exports = router