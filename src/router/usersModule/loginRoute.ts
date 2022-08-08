import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";
import loginControllers from "../../controllers/usersModule/loginController";

const router = Router()


router.post("/login", loginControllers.login);
router.post("/logout", [validarJWT], loginControllers.logout);

router.put("/setActivo", loginControllers.setActivo);
//devolver el rol activo del usuario en la sesión
router.get("/getInfoUsuario/:token", [validarJWT], loginControllers.getInfoUsuarios);

module.exports = router