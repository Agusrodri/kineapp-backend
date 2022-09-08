import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Ejercicio from '../../models/entities/tratamientosModule/ejercicio';

const ejerciciosController = {

    getEjercicios: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const ejercicios = await Ejercicio.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!ejercicios) {
                throw new Error("No existen ejercicios cargados en la institución.")
            }

            res.status(200).json(ejercicios)
        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getEjercicioById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idEjercicio } = req.params
            const ejercicio = await Ejercicio.findOne({
                where: {
                    id: idEjercicio,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!ejercicio) {
                throw new Error("No existe el ejercicio solicitado.")
            }

            res.status(200).json(ejercicio)
        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    agregarEjercicio: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { nombre, complejidad, descripcion } = req.body

            const ejercicio = await Ejercicio.findOne({
                where: {
                    nombre: nombre,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (ejercicio) {
                throw new Error("Ya existe un ejercicio con ese nombre en la institución.")
            }

            const newEjercicio = await Ejercicio.create({
                nombre: nombre,
                complejidad: complejidad,
                descripcion: descripcion,
                fk_idPersonaJuridica: idPersonaJuridica,
                gif: "gif-not-uploaded",
                activo: true
            })

            res.status(200).json({
                msg: "Ejercicio agregado correctamente",
                newEjercicio
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarEjercicioById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idEjercicio } = req.params
            const { nombre, complejidad, descripcion } = req.body
            const ejercicio = await Ejercicio.findOne({
                where: {
                    id: idEjercicio,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!ejercicio) {
                throw new Error("No existe el ejercicio solicitado.")
            }

            const ejercicioToFind = await Ejercicio.findOne({
                where: {
                    id: { [Op.notIn]: [idEjercicio] },
                    nombre: nombre,
                    activo: true
                }
            })

            if (ejercicioToFind) {
                throw new Error("El nombre que desea agregar ya está en uso, compruebe si ya está cargado o ingrese un nombre diferente.")
            }

            await ejercicio.update({
                nombre: nombre,
                complejidad: complejidad,
                descripcion: descripcion
            })

            res.status(200).json({
                msg: "Ejercicio actualizado con éxito.",
                ejercicio
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarGIF: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idEjercicio } = req.params
            const ejercicio = await Ejercicio.findOne({
                where: {
                    id: idEjercicio,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!ejercicio) {
                throw new Error("No existe el ejercicio solicitado.")
            }

            await ejercicio.update({ gif: "gif-not-uploaded" })

            res.status(200).json({
                msg: "GIF del ejercicio eliminada correctamente.",
                ejercicio
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarEjercicio: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idEjercicio } = req.params
            const ejercicio = await Ejercicio.findOne({
                where: {
                    id: idEjercicio,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!ejercicio) {
                throw new Error("No existe el ejercicio solicitado.")
            }

            await ejercicio.update({ activo: false })

            res.status(200).json({
                msg: "Ejercicio eliminado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default ejerciciosController;