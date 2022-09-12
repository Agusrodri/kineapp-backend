import { Request, Response } from 'express';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import Rutina from '../../models/entities/tratamientosModule/rutina';
import RutinaEjercicio from '../../models/entities/tratamientosModule/rutinaEjercicio';

const rutinaController = {

    createRutina: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params
            const ejercicios = req.body //consultar si pasar también el orden

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")
            }

            if (tratamientoPaciente['dataValues']['finalizado'] == true) {
                throw new Error("No fue posible crear la rutina. El tratamiento se encuentra finalizado.")
            }

            const newRutina = await Rutina.create({
                //order: 
                fk_idTratamientoPaciente: idTratamientoPaciente,
                activo: true,
                finalizada: false,
                fechaFinalizacion: null
            })

            const ejerciciosRutina = []

            for (let i = 0; i < ejercicios.length; i++) {

                const newRutinaEjercicio = await RutinaEjercicio.create({
                    duracion: ejercicios[i]['duracion'],
                    cantidadRepeticiones: ejercicios[i]['repeticiones'],
                    //contadorCheck:
                    fk_idRutina: newRutina['dataValues']['id'],
                    fk_idEjercicio: ejercicios[i]['id'],
                    nombreEjercicio: ejercicios[i]['nombre']
                })

                ejerciciosRutina.push(newRutinaEjercicio)

            }

            const rutinaResponse = {
                id: newRutina['dataValues']['id'],
                orden: newRutina['dataValues']['orden'],
                idTratamientoPaciente: newRutina['dataValues']['fk_idTratamientoPaciente'],
                activo: newRutina['dataValues']['activo'],
                finalizada: newRutina['dataValues']['finalizada'],
                fechaFinalizacion: newRutina['dataValues']['fechaFinalizacion'],
                rutinaEjercicios: ejerciciosRutina

            }

            res.status(200).json({
                msg: "Rutina creada con éxito.",
                rutina: rutinaResponse
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getRutinaById: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const rutinaToFind = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToFind) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            const rutinaEjercicios = await RutinaEjercicio.findAll({
                where: {
                    fk_idRutina: rutinaToFind['dataValues']['id']
                }
            })

            const rutinaEjerciciosRes = []
            for (let i = 0; i < rutinaEjercicios.length; i++) {

                const rutinaEjercicio = {
                    id: rutinaEjercicios[i]['dataValues']['id'],
                    duracion: rutinaEjercicios[i]['dataValues']['duracion'],
                    fk_idRutina: rutinaEjercicios[i]['dataValues']['fk_idRutina'],
                    fk_idEjercicio: rutinaEjercicios[i]['dataValues']['fk_idEjercicio'],
                    nombreEjercicio: rutinaEjercicios[i]['dataValues']['nombreEjercicio'],
                    cantidadRepeticiones: rutinaEjercicios[i]['dataValues']['cantidadRepeticiones']
                }

                rutinaEjerciciosRes.push(rutinaEjercicio)
            }

            const responseFinal = {
                id: rutinaToFind['dataValues']['id'],
                idTratamientoPaciente: rutinaToFind['dataValues']['fk_idTratamientoPaciente'],
                activo: rutinaToFind['dataValues']['activo'],
                finalizada: rutinaToFind['dataValues']['finalizada'],
                fechaFinalizacion: rutinaToFind['dataValues']['fechaFinalizacion'],
                rutinaEjercicios: rutinaEjerciciosRes
            }

            res.status(200).json(responseFinal)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const ejercicios = req.body

            const rutinaToEdit = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToEdit) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            if (rutinaToEdit['dataValues']['finalizada'] == true) {
                throw new Error("No fue posible editar la rutina. La misma ya se encuentra finalizada.")
            }

            await RutinaEjercicio.destroy({
                where: {
                    fk_idRutina: rutinaToEdit['dataValues']['id']
                }
            })

            const ejerciciosRutina = []

            for (let i = 0; i < ejercicios.length; i++) {

                const newRutinaEjercicio = await RutinaEjercicio.create({
                    duracion: ejercicios[i]['duracion'],
                    cantidadRepeticiones: ejercicios[i]['repeticiones'],
                    //contadorCheck:
                    fk_idRutina: rutinaToEdit['dataValues']['id'],
                    fk_idEjercicio: ejercicios[i]['id'],
                    nombreEjercicio: ejercicios[i]['nombre']
                })

                ejerciciosRutina.push(newRutinaEjercicio)

            }

            const responseFinal = {
                id: rutinaToEdit['dataValues']['id'],
                idTratamientoPaciente: rutinaToEdit['dataValues']['fk_idTratamientoPaciente'],
                activo: rutinaToEdit['dataValues']['activo'],
                finalizada: rutinaToEdit['dataValues']['finalizada'],
                fechaFinalizacion: rutinaToEdit['dataValues']['fechaFinalizacion'],
                rutinaEjercicios: ejerciciosRutina
            }

            res.status(200).json({
                msg: "Rutina actualizada con éxito.",
                rutina: responseFinal
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    finalizarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const rutinaToEnd = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToEnd) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            if (rutinaToEnd['dataValues']['finalizada'] == true) {
                throw new Error("La rutina ya se encuentra finalizada.")
            }

            const fechaFinRutina = (new Date()).toISOString().split("T")[0]
            await rutinaToEnd.update({ finalizada: true, fechaFinalizacion: fechaFinRutina })

            res.status(200).json({
                msg: "Rutina finalizada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const rutinaToDelete = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToDelete) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            await rutinaToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Rutina eliminada correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default rutinaController;