import multer from 'multer';
import { NextFunction, Request, Response } from "express"
import url from 'url'

const maxSize = 4 * 1024 * 1024;

const fileFilter = (req: Request, file, cb) => {

    if (file.mimetype.split('/')[1] === req.typeFile) {
        req.fileValidationError = false
        cb(null, true);

    } else {
        req.fileValidationError = true
        cb(null, false);
        //cb(`Sólo se permiten archivos de tipo ${req.typeFile.toUpperCase()}`, false, new Error("Probando error"));
    }
};

const storage = multer.diskStorage({

    destination: (req: Request, file, cb) => {

        const queryObject = url.parse(req.url, true).query;
        cb(null, globalThis.__basedir + "/resources/static/assets/files/" + queryObject['path']);

    },

    filename: (req: Request, file, cb) => {

        const ext = file.mimetype.split('/')[1]
        const queryObject = url.parse(req.url, true).query;

        if (ext == "pdf") {
            cb(null, "file-" + "id-" + queryObject['id'] + "." + ext);
        } else if (ext == "gif") {
            const modifiedName = "file-" + "id-ejercicio-" + queryObject['id'] + "." + ext
            req.lastModifiedName = modifiedName
            cb(null, modifiedName);
        }
    },
});

const uploadFile = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: maxSize } });

export default uploadFile