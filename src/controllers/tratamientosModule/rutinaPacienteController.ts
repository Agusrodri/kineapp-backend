import { Request, Response } from 'express';
import Rutina from '../../models/entities/tratamientosModule/rutina';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import RutinaEjercicio from '../../models/entities/tratamientosModule/rutinaEjercicio';
import { Op } from 'sequelize';
import RutinaComentario from '../../models/entities/tratamientosModule/rutinaComentario';
import RecordatorioRutina from '../../models/entities/tratamientosModule/recordatorioRutina';
import Profesional from '../../models/entities/usersModule/profesional';
import Usuario from '../../models/entities/usersModule/usuario';
import sendNotification from '../../helpers/sendNotification';
import Paciente from '../../models/entities/usersModule/paciente';
import Notificacion from '../../models/entities/usersModule/notificacion';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';

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

            const { idRutina } = req.params;
            const { jsonRutina, completa, rutinaEjercicios } = req.body;

            //búsqueda de la rutina solicitada por parámetro
            const rutina = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true,
                    finalizada: false
                }
            });

            //error en caso de no hallar la rutina
            if (!rutina) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            //se recibe una bandera en el body de la petición que indica si la rutina se encuentra completa o no
            if (completa === true) {

                //realizamos la búsqueda de todos los ejercicios presentes en la rutina
                const rutinaEjerciciosAll = await RutinaEjercicio.findAll({
                    where: {
                        fk_idRutina: idRutina
                    }
                });

                //se actualiza la rutina con el objeto JSON recibido en el body
                //el mismo contiene información necesaria para ejecutar procesos en el frontend
                //la bandera mostrarRutinaBandera indica si se debe permitir o denegar el acceso a la rutina
                await rutina.update({ jsonRutina: JSON.stringify(jsonRutina), mostrarRutinaBandera: false });

                //obtenemos el último valor del contador de racha
                const lastContadorRacha = rutina['dataValues']['contadorRacha'];

                //creamos una fecha actual para actualizar dateLastRacha de rutina
                //realizamos la conversión al formato universal UTC
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

                //si la diferencia es mayor a 2 días, el contador se resetea. Si no, se incrementa en 1 
                //secondsDifBetweenDates < 172800 ? //172800 seconds == 48 hours == 2 days
                await rutina.update({ contadorRacha: lastContadorRacha + 1, dateLastRacha: newDateLastRachaUTC.getTime().toString() });

                //reseteamos a 0 (cero) el contador particular de cada ejercicio
                rutinaEjerciciosAll.forEach(async rutinaEjercicio => {
                    await rutinaEjercicio.update({ contadorCheck: 0 })
                });

                //respuesta final
                return res.status(200).json({
                    restart: true,
                    jsonRutina: jsonRutina
                });

            } else {

                //si no finalizó la rutina, también se actualiza la misma con el objeto JSON recibido en el body
                //en este caso, la bandera mostrarRutinaBandera se coloca en true
                await rutina.update({ jsonRutina: JSON.stringify(jsonRutina), mostrarRutinaBandera: true });

                //recorremos el arreglo recibido en el body que contiene los ejercicios de la rutina
                //actualizamos el contador de cada uno de ellos
                for (let i = 0; i < rutinaEjercicios.length; i++) {

                    const rutinaEjercicio = await RutinaEjercicio.findOne({
                        where: {
                            fk_idRutina: idRutina,
                            fk_idEjercicio: rutinaEjercicios[i]['id']
                        }
                    });

                    await rutinaEjercicio.update({ contadorCheck: rutinaEjercicios[i]['contadorCheck'] });
                }

                //respuesta final
                return res.status(200).json({
                    restart: false,
                    jsonRutina: jsonRutina
                });
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

            const rutinaActiva = await Rutina.findOne({
                where: {
                    fk_idTratamientoPaciente: idTratamientoPaciente,
                    activo: true,
                    finalizada: false
                }
            })

            const repeticionesRutina = [0]
            if (rutinaActiva) {
                const rutinaEjercicios = await RutinaEjercicio.findAll({
                    where: {
                        fk_idRutina: rutinaActiva['dataValues']['id']
                    }
                })

                if (rutinaEjercicios) {
                    for (let i = 0; i < rutinaEjercicios.length; i++) {
                        repeticionesRutina.push(rutinaEjercicios[i]['dataValues']['cantidadRepeticiones'])
                    }
                }
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
                activo: tratamientoPaciente['dataValues']['activo'],
                maxRepeticiones: Math.max(...repeticionesRutina)
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

            const tratamientoPacienteToFind = await TratamientoPaciente.findByPk(rutina['dataValues']['fk_idTratamientoPaciente']);

            let profesionalToNotificate = null;
            let usuarioProfesionalToNotificate = null;
            let institucionToNotificate = null;
            let usuarioInstitucionToNotificate = null;
            if (rutina['dataValues']['fk_idProfesional']) {
                profesionalToNotificate = await Profesional.findByPk(rutina['dataValues']['fk_idProfesional']);
                usuarioProfesionalToNotificate = await Usuario.findByPk(profesionalToNotificate['dataValues']['fk_idUsuario']);
            } else {
                institucionToNotificate = await PersonaJuridica.findByPk(tratamientoPacienteToFind['dataValues']['fk_idPersonaJuridica']);
                usuarioInstitucionToNotificate = await Usuario.findByPk(institucionToNotificate['dataValues']['fk_idUsuarios']);
            }

            const pacienteToNotificate = await Paciente.findByPk(tratamientoPacienteToFind['dataValues']['fk_idPaciente']);
            const usuarioPacienteToNotificate = await Usuario.findByPk(pacienteToNotificate['dataValues']['fk_idUsuario']);

            if (isComentarioPaciente == true) {
                const notificationBody = `El paciente ${pacienteToNotificate['dataValues']['apellido']}, ${pacienteToNotificate['dataValues']['nombre']} realizó un comentario en su rutina activa.`;
                if (profesionalToNotificate && usuarioProfesionalToNotificate['dataValues']['subscription']) {

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuarioProfesionalToNotificate['dataValues']['id'],
                        titulo: "Nuevo comentario de paciente en rutina"
                    })

                    sendNotification(usuarioProfesionalToNotificate['dataValues']['subscription'], notificationBody);
                } else if (institucionToNotificate && usuarioInstitucionToNotificate['dataValues']['subscription']) {

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuarioInstitucionToNotificate['dataValues']['id'],
                        titulo: "Nuevo comentario de paciente en rutina"
                    })

                    sendNotification(usuarioInstitucionToNotificate['dataValues']['subscription'], notificationBody);
                }
            } else {

                if (usuarioPacienteToNotificate['dataValues']['subscription']) {
                    const notificationBody = `El profesional ${profesionalToNotificate['dataValues']['apellido']}, ${profesionalToNotificate['dataValues']['nombre']} realizó un comentario en tu rutina activa.`;

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuarioPacienteToNotificate['dataValues']['id'],
                        titulo: "Nuevo comentario de profesional en rutina"
                    })

                    sendNotification(usuarioPacienteToNotificate['dataValues']['subscription'], notificationBody)
                }
            }

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
    },

    setAlarmas: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params;
            const { alarmas } = req.body;

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")

            }

            const rutinaActiva = await Rutina.findOne({
                where: {
                    fk_idTratamientoPaciente: idTratamientoPaciente,
                    activo: true,
                    finalizada: false
                }
            })

            if (!rutinaActiva) {
                throw new Error("El tratamiento no posee una rutina activa.")
            }

            for (let i = 0; i < alarmas.length; i++) {

                await RecordatorioRutina.create({
                    horario: alarmas[i]['horario'],
                    fk_idRutina: rutinaActiva['dataValues']['id'],
                    repeticion: alarmas[i]['repeticion'],
                    activo: true,
                    habilitado: true
                })

            }

            res.status(200).json({
                msg: "Alarmas definidas con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getAlarmas: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params;
            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")

            }

            const rutinaActiva = await Rutina.findOne({
                where: {
                    fk_idTratamientoPaciente: idTratamientoPaciente,
                    activo: true,
                    finalizada: false
                }
            })

            if (!rutinaActiva) {
                throw new Error("El tratamiento no posee una rutina activa.")
            }

            const recordatorios = await RecordatorioRutina.findAll({
                where: {
                    fk_idRutina: rutinaActiva['dataValues']['id']
                }
            })

            const response = recordatorios ? recordatorios : [];

            res.status(200).json(response)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    modificarAlarmas: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params;
            const { alarmas } = req.body;

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")

            }

            const rutinaActiva = await Rutina.findOne({
                where: {
                    fk_idTratamientoPaciente: idTratamientoPaciente,
                    activo: true,
                    finalizada: false
                }
            })

            if (!rutinaActiva) {
                throw new Error("El tratamiento no posee una rutina activa.")
            }

            for (let index = 0; index < alarmas.length; index++) {
                const recordatorio = await RecordatorioRutina.findByPk(alarmas[index]['id'])

                if (recordatorio) { await recordatorio.update({ horario: alarmas[index]['horario'], activo: alarmas[index]['activo'] }) }

            }

            res.status(200).json({
                msg: "Alarmas actualizadas con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default rutinaPacienteController;