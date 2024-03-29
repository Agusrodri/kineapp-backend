import { Router } from "express";
import { check } from "express-validator";
import validatePDF from "../../middlewares/validatePDF";
import validateGIF from "../../middlewares/validateGIF";
import fileController from "../../controllers/files/fileController";
import uploadFile from "../../middlewares/upload";
import validarJWT from "../../middlewares/validateJWT";


const router = Router()

//------------archivos de habilitaciones-------------
router.post("/uploadHabilitaciones", [

    validatePDF.validate,
    uploadFile.single('file'),
    validarJWT

], fileController.uploadHabilitaciones);

//download y get son particulares de cada tipo de archivo (habilitaciones o gifs) para facilitar al front
router.get("/downloadHabilitacion/:path/:fileName", fileController.downloadHabilitaciones)

router.get("/getHabilitaciones/:path", [validarJWT], fileController.getHabilitacionesFiles)

//------------archivos de ejercicios-------------
router.post("/uploadGIF", [

    validateGIF.validate,
    uploadFile.single('file'),
    validarJWT

], fileController.uploadGIFS)

//module.exports = router

export default router;