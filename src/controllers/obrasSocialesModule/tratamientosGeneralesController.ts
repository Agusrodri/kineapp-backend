import { Request, Response } from "express"
import { Op } from 'sequelize';
import TratamientoGeneral from "../../models/entities/obrasSocialesModule/tratamientoGeneral";


const tratamientosGeneralesController = {

    getTratamientosGenerales: async (req: Request, res: Response) => {

        try {

            const tratamientosGrales = await TratamientoGeneral.findAll({
                where: {
                    activo: true
                }
            })

            res.status(200).json(tratamientosGrales)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTratamientoGeneralById: async (req: Request, res: Response) => {

        try {

            const { idTratamientoGeneral } = req.params

            const tratamientoGeneral = await TratamientoGeneral.findOne({
                where: {
                    id: idTratamientoGeneral,
                    activo: true
                }
            })

            if (!tratamientoGeneral) {
                throw new Error("No existe el tratamiento solicitado.")
            }

            res.status(200).json(tratamientoGeneral)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    agregarTratamientoGeneral: async (req: Request, res: Response) => {

        try {

            const { nombre, descripcion } = req.body

            const tratamientoToFind = await TratamientoGeneral.findOne({
                where: {
                    nombre: nombre,
                    activo: true
                }
            })

            if (tratamientoToFind) {
                throw new Error("El nombre que desea agregar ya está en uso, compruebe si el tratamiento ya está cargado o ingrese un nombre diferente.")
            }

            const tratamientoGeneral = await TratamientoGeneral.create({
                nombre: nombre,
                descripcion: descripcion,
                activo: true
            })

            res.status(200).json({
                msg: "Tratamiento creado correctamente.",
                tratamientoGeneral
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarTratamientoGeneral: async (req: Request, res: Response) => {

        try {

            const { idTratamientoGeneral } = req.params
            const { nombre, descripcion } = req.body

            const tratamientoGeneralToUpdate = await TratamientoGeneral.findOne({
                where: {
                    id: idTratamientoGeneral,
                    activo: true
                }
            })

            if (!tratamientoGeneralToUpdate) {
                throw new Error("No existe el tratamiento solicitado.")
            }

            const tratamientoToFind = await TratamientoGeneral.findOne({
                where: {
                    id: {
                        [Op.notIn]: [idTratamientoGeneral]
                    },
                    nombre: nombre,
                    activo: true
                }
            })

            if (tratamientoToFind) {
                throw new Error("El nombre que desea agregar ya está en uso, compruebe si el tratamiento ya está cargado o ingrese un nombre diferente.")
            }

            await tratamientoGeneralToUpdate.update({ nombre: nombre, descripcion: descripcion })

            res.status(200).json({
                msg: "Tratamiento actualizado con éxito.",
                tratamientoGneral: tratamientoGeneralToUpdate
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarTratamientoGeneral: async (req: Request, res: Response) => {

        try {

            const { idTratamientoGeneral } = req.params
            const tratamientoGeneralToDelete = await TratamientoGeneral.findOne({
                where: {
                    id: idTratamientoGeneral,
                    activo: true
                }
            })

            if (!tratamientoGeneralToDelete) {
                throw new Error("No existe el tratamiento solicitado.")
            }

            await tratamientoGeneralToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Tratamiento eliminado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}


export default tratamientosGeneralesController;