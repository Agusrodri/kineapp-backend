import { Router } from "express";
import { check } from "express-validator";
import userController from "../../controllers/usersModule/usersController";

const router = Router()


router.get("/", userController.usersGet);

module.exports = router