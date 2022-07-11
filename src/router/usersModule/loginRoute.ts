import { Router } from "express";
import { check } from "express-validator";
import loginControllers from "../../controllers/usersModule/loginController";

const router = Router()


router.post("/login", loginControllers.login);

module.exports = router