import { Request, Response } from "express"
import fs from 'fs'
import Ejercicio from "../../models/entities/tratamientosModule/ejercicio";
import url from 'url'
import PersonaJuridica from "../../models/entities/usersModule/personaJuridica"

const fileController = {

    uploadGIFS: async (req: Request, res: Response) => {

        try {

            if (req.fileValidationError) {
                throw new Error(`Sólo se permiten archivos de tipo ${req.typeFile.toUpperCase()}`)
            }
            if (req.file == undefined) {
                return res.status(400).json({ message: "Por favor, suba un archivo." });
            }

            const queryObject = url.parse(req.url, true).query;
            const idEjercicio = parseInt(queryObject['id'].toString());
            const codigoEjercicio = queryObject['codigo']
            const ejercicio = await Ejercicio.findOne({
                where: {
                    id: idEjercicio,
                    codigo: codigoEjercicio,
                    activo: true
                }
            })

            if (!ejercicio) {
                throw new Error("El id y código no se corresponden. Intente nuevamente.")
            }

            await ejercicio.update({ gif: `${globalThis.__baseurl2}${req.lastModifiedName}` })

            res.status(200).json({
                message: "Archivo subido con éxito." + req.file.originalname,
            });

        } catch (error) {
            res.status(500).json({
                message: `No fue posible subir el archivo. ${error}`,
            });
        }
    },

    uploadHabilitaciones: async (req: Request, res: Response) => {

        try {

            if (req.fileValidationError) {
                throw new Error(`Sólo se permiten archivos de tipo ${req.typeFile.toUpperCase()}`)
            }
            if (req.file == undefined) {
                return res.status(400).json({ message: "Por favor, suba un archivo." });
            }

            const queryObject = url.parse(req.url, true).query;
            const id = parseInt(queryObject['id'].toString())
            const pathSplit = queryObject['path'].toString().split('/')[2]
            const personaJuridica = await PersonaJuridica.findByPk(id)

            //verificar el tipo de habilitación 
            if (queryObject['path'].includes("habMinisterioSalud")) {

                await personaJuridica.update({ habMinisterioSalud: `${globalThis.__baseurl}usuarios/downloadHabilitacion/${pathSplit}/file-id-${id}.pdf` })

            } else if (queryObject['path'].includes("habMunicipal")) {

                await personaJuridica.update({ habMunicipal: `${globalThis.__baseurl}usuarios/downloadHabilitacion/${pathSplit}/file-id-${id}.pdf` })

            } else if (queryObject['path'].includes("habSuperintendencia")) {

                await personaJuridica.update({ habSuperintendencia: `${globalThis.__baseurl}usuarios/downloadHabilitacion/${pathSplit}/file-id-${id}.pdf` })

            } else {
                throw new Error("No se encuentra la ruta especificada.")
            }

            res.status(200).json({
                message: "Archivo subido con éxito." + req.file.originalname,
            });

        } catch (err) {
            res.status(500).json({
                message: `No fue posible subir el archivo. ${err}`,
            });
            //${req.file.originalname}
        }
    },

    getHabilitacionesFiles: (req: Request, res: Response) => {

        try {
            const { path } = req.params
            const directoryPath = globalThis.__basedir + `/resources/static/assets/files/usuarios/instituciones/${path}/`;

            fs.readdir(directoryPath, function (err, files) {
                if (err) {
                    res.status(500).send({
                        message: "No se pudieron escanear archivos.",
                    });
                }
                let fileInfos = [];
                files.forEach(file => {
                    fileInfos.push({
                        name: file,
                        url: globalThis.__baseurl + `usuarios/downloadHabilitacion/${path}/${file}`,
                    });
                });
                res.status(200).json(fileInfos);
            });

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    downloadHabilitaciones: (req: Request, res: Response) => {

        const { fileName, path } = req.params
        const directoryPath = globalThis.__basedir + `/resources/static/assets/files/usuarios/instituciones/${path}/${fileName}`;

        res.download(directoryPath, fileName, (err) => {
            if (err) {
                res.status(500).send({
                    message: "No fue posible descargar el archivo" + err,
                });
            }
        });
    }

};

export default fileController;