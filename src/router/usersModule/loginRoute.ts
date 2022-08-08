import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";
import loginControllers from "../../controllers/usersModule/loginController";

const router = Router()


router.post("/login", loginControllers.login);
router.post("/logout", [validarJWT], loginControllers.logout);

router.put("/setActivo", loginControllers.setActivo);

module.exports = router