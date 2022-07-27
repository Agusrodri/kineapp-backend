import multer from 'multer';
import { Request } from "express"
import url from 'url'

const maxSize = 2 * 1024 * 1024;

const fileFilter = (req: Request, file, cb) => {

    if (file.mimetype.split('/')[1] === req.typeFile) {

        cb(null, true);

    } else {

        cb(`Sólo se permiten archivos de tipo ${req.typeFile.toUpperCase()}`, false);

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

        cb(null, "file-" + "id-" + queryObject['id'] + "." + ext);
    },
});

const uploadFile = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: maxSize } });

export default uploadFile