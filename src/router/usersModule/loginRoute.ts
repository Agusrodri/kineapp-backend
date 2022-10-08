import { Router } from "express";
import { check } from "express-validator";
import validarJWT from "../../middlewares/validateJWT";
import loginControllers from "../../controllers/usersModule/loginController";

import notificationsController from "../../controllers/usersModule/notificationsController"

const router = Router()


router.post("/login", loginControllers.login);
router.get("/logout", [validarJWT], loginControllers.logout);

router.put("/setActivo", loginControllers.setActivo);
//devolver el rol activo del usuario en la sesión
router.get("/getInfoUsuario", [validarJWT], loginControllers.getInfoUsuarios);
router.get("/getInfoPerfil/:idUsuario", [validarJWT], loginControllers.getInfoPerfil);
router.get("/validarJWT/:token", loginControllers.validateJWT);
router.post("/emailToRestorePassword", loginControllers.sendEmailToRestorePassword);
router.put("/restorePassword/:idUsuario", loginControllers.restorePassword);

//notifications
router.put("/setSubscription/:idUsuario", notificationsController.setSubscription);
router.get("/notificaciones/:idUsuario", notificationsController.getNotificaciones);
router.get("/notificacion/:idNotificacion", notificationsController.getNotificacionById);

export default router;