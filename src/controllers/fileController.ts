import { Request, Response } from "express"
import uploadFile from '../middlewares/upload'
import fs from 'fs'
import url from 'url'

const fileController = {
    upload: async (req: Request, res: Response) => {

        try {

            if (req.file == undefined) {
                return res.status(400).send({ message: "Please upload a file!" });
            }
            res.status(200).send({
                message: "Archivo subido con éxito: " + req.file.originalname,
            });
        } catch (err) {
            res.status(500).send({
                message: `No fue posible subir el archivo: ${req.file.originalname}. ${err}`,
            });
        }
    },

    getListFiles: (req: Request, res: Response) => {

        const queryObject = url.parse(req.url, true).query;

        const directoryPath = globalThis.__basedir + "/resources/static/assets/files/" + req.path;

        fs.readdir(directoryPath, function (err, files) {
            if (err) {
                res.status(500).send({
                    message: "Unable to scan files!",
                });
            }
            let fileInfos = [];
            files.forEach((file) => {
                fileInfos.push({
                    name: file,
                    url: globalThis.__baseurl + file,
                });
            });
            res.status(200).send(fileInfos);
        });
    },

    download: (req: Request, res: Response) => {
        const fileName = req.params.name;
        const directoryPath = globalThis.__basedir + "/resources/static/assets/files/usuarios/instituciones/habMunicipal/file-id-1.pdf";
        res.download(directoryPath, fileName, (err) => {
            if (err) {
                res.status(500).send({
                    message: "Could not download the file. " + err,
                });
            }
        });

    }

};

export default fileController;