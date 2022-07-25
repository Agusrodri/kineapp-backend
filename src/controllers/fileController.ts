import { Request, Response } from "express"
import uploadFile from '../middlewares/upload'
import fs from 'fs'

const fileController = {
    upload: async (req: Request, res: Response) => {
        try {

            if (req.file == undefined) {
                return res.status(400).send({ message: "Please upload a file!" });
            }
            res.status(200).send({
                message: "Uploaded the file successfully: " + req.file.originalname,
            });
        } catch (err) {
            res.status(500).send({
                message: `Could not upload the file: ${req.file.originalname}. ${err}`,
            });
        }
    },

    getListFiles: (req: Request, res: Response) => {
        const directoryPath = __dirname + "/resources/static/assets/files/" + req.path;
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
                    url: "http://localhost:8003" + file,
                });
            });
            res.status(200).send(fileInfos);
        });
    },

    download: (req: Request, res: Response) => {
        const fileName = req.params.name;
        const directoryPath = globalThis.__basedir + "/resources/static/assets/files/foto.jpg";
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