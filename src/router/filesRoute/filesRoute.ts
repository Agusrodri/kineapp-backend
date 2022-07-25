import { Router } from "express";
import { check } from "express-validator";
import fileController from "../../controllers/fileController";
import uploadFile from "../../middlewares/upload";

const router = Router()

router.post("/upload", uploadFile.single('file'), fileController.upload);
router.get("/file", fileController.download)

module.exports = router