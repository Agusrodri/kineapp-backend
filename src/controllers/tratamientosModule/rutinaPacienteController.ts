import { Request, Response } from 'express';
import Rutina from '../../models/entities/tratamientosModule/rutina';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import RutinaEjercicio from '../../models/entities/tratamientosModule/rutinaEjercicio';
import { Op } from 'sequelize';
import RutinaComentario from '../../models/entities/tratamientosModule/rutinaComentario';

const rutinaPacienteController = {

    getTratamientosPaciente: async (req: Request, res: Response) => {

        try {

            const { idPaciente } = req.params
            const tratamientosPaciente = await TratamientoPaciente.findAll({
                where: {
                    fk_idPaciente: idPaciente,
                    activo: true
                }
            })

            if (!tratamientosPaciente) {
                throw new Error("El paciente no posee tratamientos asignados.")
            }

            const tratamientosResponse = []
            for (let i = 0; i < tratamientosPaciente.length; i++) {

                const tratamientoParticular = await TratamientoParticular.findOne({
                    where: {
                        id: tratamientosPaciente[i]['fk_idTratamiento'],
                        activo: true
                    }
                })

                const tratamientoPaciente = {
                    id: tratamientosPaciente[i]['dataValues']['id'],
                    fechaInicio: tratamientosPaciente[i]['dataValues']['fechaInicio'],
                    fechaFinEstimada: tratamientosPaciente[i]['dataValues']['fechaFinEstimada'],
                    fechaFinReal: tratamientosPaciente[i]['dataValues']['fechaFinReal'],
                    idPaciente: tratamientosPaciente[i]['dataValues']['fk_idPaciente'],
                    fk_idTratamiento: tratamientosPaciente[i]['dataValues']['fk_idTratamiento'],
                    fk_idPersonaJuridica: tratamientosPaciente[i]['dataValues']['fk_idPersonaJuridica'],
                    tratamiento: tratamientoParticular ? tratamientoParticular['dataValues']['nombre'] : null,
                    nombrePaciente: tratamientosPaciente[i]['dataValues']['nombrePaciente'],
                    finalizado: tratamientosPaciente[i]['dataValues']['finalizado'],
                    activo: tratamientosPaciente[i]['dataValues']['activo']
                }
                tratamientosResponse.push(tratamientoPaciente)
            }

            res.status(200).json(tratamientosResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    setContadorCheck: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const { jsonRutina, completa, rutinaEjercicios } = req.body
            const rutina = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true,
                    finalizada: false
                }
            })

            if (!rutina) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            if (completa === true) {

                const rutinaEjerciciosAll = await RutinaEjercicio.findAll({
                    where: {
                        fk_idRutina: idRutina
                    }
                })

                await rutina.update({ jsonRutina: JSON.stringify(jsonRutina) })

                //obtenemos el último valor del contador de racha
                const lastContadorRacha = rutina['dataValues']['contadorRacha'];

                //obtenemos la fecha donde se actualizó ese último valor de contador
                const dateLastRacha = rutina['dataValues']['dateLastRacha'];
                const newDateLastRachaFormat = new Date(Number(dateLastRacha));
                const utcDayLastUpdate = ((((newDateLastRachaFormat.toISOString()).split("T")))[0].split("-"))[2];
                const dateLastRachaUTC = new Date(Date.UTC(newDateLastRachaFormat.getFullYear(),
                    newDateLastRachaFormat.getMonth(),
                    Number(utcDayLastUpdate),
                    0,
                    0,
                    0,
                    0
                ));

                //creamos una fecha actual para actualizar dateLastRacha de rutina
                const newDateLastRacha = new Date();
                const utcDay = ((((newDateLastRacha.toISOString()).split("T")))[0].split("-"))[2];
                const newDateLastRachaUTC = new Date(Date.UTC(newDateLastRacha.getFullYear(),
                    newDateLastRacha.getMonth(),
                    Number(utcDay),
                    0,
                    0,
                    0,
                    0
                ));

                //realizamos la diferencia entre la nueva fecha y la anterior
                const difBetweenDates = Number(newDateLastRachaUTC.getTime()) - Number(dateLastRachaUTC.getTime())
                const secondsDifBetweenDates = difBetweenDates / 1000

                //si la diferencia es mayor a 2 días, el contador se resetea. Si no, se incrementa en 1 
                secondsDifBetweenDates < 172800 ? //172800 seconds == 48 hours == 2 days
                    await rutina.update({ contadorRacha: lastContadorRacha + 1, dateLastRacha: newDateLastRachaUTC.getTime().toString() }) :
                    await rutina.update({ contadorRacha: 0, dateLastRacha: newDateLastRachaUTC.getTime().toString() })

                rutinaEjerciciosAll.forEach(async rutinaEjercicio => {
                    await rutinaEjercicio.update({ contadorCheck: 0 })
                })

                return res.status(200).json({
                    restart: true,
                    jsonRutina: jsonRutina
                })

            } else {

                await rutina.update({ jsonRutina: JSON.stringify(jsonRutina) })

                for (let i = 0; i < rutinaEjercicios.length; i++) {
                    const rutinaEjercicio = await RutinaEjercicio.findOne({
                        where: {
                            fk_idRutina: idRutina,
                            fk_idEjercicio: rutinaEjercicios[i]['id']
                        }
                    })
                    await rutinaEjercicio.update({ contadorCheck: rutinaEjercicios[i]['contadorCheck'] })
                }

                return res.status(200).json({
                    restart: false,
                    jsonRutina: jsonRutina
                })
            }
        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTratamiento: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params
            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")

            }

            const tratamientoParticular = await TratamientoParticular.findOne({
                where: {
                    id: tratamientoPaciente['dataValues']['fk_idTratamiento'],
                    activo: true
                }
            })

            if (!tratamientoParticular) {
                throw new Error("No existe el tratamiento particular asociado.")

            }

            const response = {
                id: tratamientoPaciente['dataValues']['id'],
                fechaInicio: tratamientoPaciente['dataValues']['fechaInicio'],
                fechaFinEstimada: tratamientoPaciente['dataValues']['fechaFinEstimada'],
                fechaFinReal: tratamientoPaciente['dataValues']['fechaFinReal'],
                idPaciente: tratamientoPaciente['dataValues']['fk_idPaciente'],
                fk_idTratamiento: tratamientoPaciente['dataValues']['fk_idTratamiento'],
                fk_idPersonaJuridica: tratamientoPaciente['dataValues']['fk_idPersonaJuridica'],
                tratamiento: tratamientoParticular['dataValues']['nombre'],
                nombrePaciente: tratamientoPaciente['dataValues']['nombrePaciente'],
                finalizado: tratamientoPaciente['dataValues']['finalizado'],
                activo: tratamientoPaciente['dataValues']['activo']
            }

            res.status(200).json(response)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    comentarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const { comentario, isComentarioPaciente } = req.body

            //verificar que la rutina exista y no esté finalizada
            const rutina = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true,
                    finalizada: false
                }
            })

            if (!rutina) {
                throw new Error("No existe la rutina solicitada.")
            }

            const newComentario = await RutinaComentario.create({
                comentario: comentario,
                isComentarioPaciente: isComentarioPaciente,
                fecha: new Date().toISOString().split("T")[0],
                fk_idRutina: Number(idRutina)
            })

            res.status(200).json({
                msg: "Comentario enviado con éxito.",
                comentario: newComentario
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getComentariosRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params

            //verificar que la rutina exista y no esté finalizada
            const rutina = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true,
                    finalizada: false
                }
            })

            if (!rutina) {
                throw new Error("No existe la rutina solicitada.")
            }

            const comentarios = await RutinaComentario.findAll({
                where: {
                    fk_idRutina: idRutina
                }
            })

            if (!comentarios) {
                throw new Error("No se encontraron comentarios dentro de esta rutina.")
            }

            res.status(200).json(comentarios)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default rutinaPacienteController;