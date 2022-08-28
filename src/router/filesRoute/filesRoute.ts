import { Router } from "express";
import { check } from "express-validator";
import nodeMailer from 'nodemailer'
import validatePDF from "../../middlewares/validatePDF";
import fileController from "../../controllers/files/fileController";
import uploadFile from "../../middlewares/upload";
import validateRequest from "../../middlewares/validateRequest";

const router = Router()

router.post("/uploadHabilitaciones", [

    validatePDF.validate,
    uploadFile.single('file')

], fileController.uploadHabilitaciones);

//download y get son particulares de cada tipo de archivo (habilitaciones o gifs) para facilitar al front
router.get("/downloadHabilitacion/:path/:fileName", fileController.downloadHabilitaciones)

router.get("/getHabilitaciones/:path", fileController.getHabilitacionesFiles)

//module.exports = router

export default router;