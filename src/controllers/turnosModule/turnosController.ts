import { Request, Response } from 'express';
import sendNotification from '../../helpers/sendNotification';
import Notificacion from '../../models/entities/usersModule/notificacion';
import Usuario from '../../models/entities/usersModule/usuario';
import PlanTratamientoGeneral from '../../models/entities/obrasSocialesModule/planTratamientoGeneral';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import ConfiguracionTurnos from '../../models/entities/turnosModule/configuracionTurnos';
import Turno from '../../models/entities/turnosModule/turno';
import Paciente from '../../models/entities/usersModule/paciente';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import Plan from '../../models/entities/obrasSocialesModule/plan';

const turnosController = {

    calcularMonto: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente } = req.params;
            const { idTratamientoParticular } = req.body;

            const institucion = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            if (!institucion) { throw new Error("No existe la institución solicitada.") }

            const paciente = await Paciente.findOne({
                where: {
                    id: idPaciente,
                    activo: true
                }
            })

            if (!paciente) { throw new Error("No existe el paciente solicitado.") }

            //buscar tratamiento particular
            const tratamiento = await TratamientoParticular.findOne({
                where: {
                    id: idTratamientoParticular,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!tratamiento) { throw new Error("No existe el tratamiento solicitado o la institución no presta el mismo.") }

            let monto: number;
            //verificar si depende de uno general (si depende, calcular el monto con el plan de la obra social del paciente)
            if (tratamiento['dataValues']['fk_idTratamientoGeneral']) {

                const planTratamientoGeneral = await PlanTratamientoGeneral.findOne({
                    where: {
                        fk_idPlan: paciente['dataValues']['fk_idPlan'],
                        fk_idTratamientoGeneral: tratamiento['dataValues']['fk_idTratamientoGeneral']
                    }
                })

                if (!planTratamientoGeneral) {
                    throw new Error(`Su plan no posee cobertura para el tratamiento ${tratamiento['dataValues']['nombre']}`)
                }

                //montoFinal = monto - monto * (porcentaje/100)

                monto = tratamiento['dataValues']['monto'] - (tratamiento['dataValues']['monto'] * (planTratamientoGeneral['dataValues']['porcentajeCobertura'] / 100));
                return res.status(200).json(monto);
            }

            monto = tratamiento['dataValues']['monto'];

            res.status(200).json(monto);

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    guardarTurno: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente } = req.params;
            const { horario,
                idTratamientoParticular,
                monto,
                nombrePersonaJuridica
            } = req.body;

            const configTurnos = await ConfiguracionTurnos.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            const turnosToFind = await Turno.findAll({
                where: {
                    horario: horario,
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            const turno = await Turno.findOne({
                where: {
                    horario: horario,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idPaciente: idPaciente
                }
            })

            if (turno) {
                throw new Error("Ya posee un turno asignado en este horario.")
            }

            if (!configTurnos && turnosToFind && turnosToFind.length >= 1) {
                throw new Error("Horario ocupado.")
            }

            if (configTurnos && turnosToFind && turnosToFind.length >= configTurnos['dataValues']['pacientesSimultaneos']) {
                throw new Error("Horario ocupado.")
            }

            const paciente = await Paciente.findOne({
                where:{
                    id: idPaciente,
                    activo: true
                }
            })

            if(!paciente){
                throw new Error("No existe el paciente solicitado.")
            }

            const obraSocialPaciente = await ObraSocial.findByPk(paciente['dataValues']['fk_idObraSocial'])
            const planPaciente = await Plan.findByPk(paciente['dataValues']['fk_idPlan'])

            const newTurno = await Turno.create({
                horario: horario,
                fk_idPaciente: Number(idPaciente),
                fk_idPersonaJuridica: Number(idPersonaJuridica),
                monto: monto,
                fk_idTratamiento: idTratamientoParticular,
                estado: "a confirmar",
                obraSocial: obraSocialPaciente? obraSocialPaciente['dataValues']['nombre']: null,
                plan: planPaciente? planPaciente['dataValues']['nombre']: null
            })

            const tratamiento = await TratamientoParticular.findOne({
                where: {
                    id: newTurno['dataValues']['fk_idTratamiento'],
                    fk_idPersonaJuridica: newTurno['dataValues']['fk_idPersonaJuridica'],
                    activo: true
                }
            });

            const response = {
                id: newTurno['dataValues']['id'],
                horario: newTurno['dataValues']['horario'],
                fk_idPaciente: newTurno['dataValues']['fk_idPaciente'],
                fk_idPersonaJuridica: newTurno['dataValues']['fk_idPersonaJuridica'],
                monto: newTurno['dataValues']['monto'],
                fk_idTratamiento: newTurno['dataValues']['fk_idTratamiento'],
                estado: newTurno['dataValues']['estado'],
                obraSocial: newTurno['dataValues']['obraSocial']? newTurno['dataValues']['obraSocial']: null,
                plan: newTurno['dataValues']['plan']? newTurno['dataValues']['plan']: null,
                nombrePersonaJuridica,
                tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
            }

            res.status(200).json({
                msg: "Turno confirmado con éxito.",
                turno: response
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTurnos: async (req: Request, res: Response) => {

        try {

            const { idPaciente } = req.params;
            const paciente = await Paciente.findOne({
                where: {
                    id: idPaciente,
                    activo: true
                }
            })

            if (!paciente) { throw new Error("No existe el paciente solicitado.") }

            const turnos = await Turno.findAll({
                where: {
                    fk_idPaciente: idPaciente
                }
            })

            const responses = []
            for (let index = 0; index < turnos.length; index++) {

                const institucion = await PersonaJuridica.findOne({
                    where: {
                        id: turnos[index]['dataValues']['fk_idPersonaJuridica'],
                        activo: true
                    }
                })

                if (!institucion) { continue }

                const tratamiento = await TratamientoParticular.findOne({
                    where: {
                        id: turnos[index]['dataValues']['fk_idTratamiento'],
                        fk_idPersonaJuridica: turnos[index]['dataValues']['fk_idPersonaJuridica'],
                        activo: true
                    }
                });

                const response = {
                    id: turnos[index]['dataValues']['id'],
                    horario: turnos[index]['dataValues']['horario'],
                    fk_idPaciente: turnos[index]['dataValues']['fk_idPaciente'],
                    fk_idPersonaJuridica: turnos[index]['dataValues']['fk_idPersonaJuridica'],
                    monto: turnos[index]['dataValues']['monto'],
                    fk_idTratamiento: turnos[index]['dataValues']['fk_idTratamiento'],
                    estado: turnos[index]['dataValues']['estado'],
                    obraSocial: turnos[index]['dataValues']['obraSocial'],
                    plan: turnos[index]['dataValues']['plan'],
                    nombrePersonaJuridica: institucion['dataValues']['nombre'],
                    tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
                }

                responses.push(response)
            }

            res.status(200).json(responses);

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTurnoById: async (req: Request, res: Response) => {

        try {

            const { idTurno } = req.params;
            const turno = await Turno.findByPk(idTurno);

            if (!turno) { throw new Error("No existe el turno solicitado.") }

            const paciente = await Paciente.findOne({
                where: {
                    id: turno['dataValues']['fk_idPaciente'],
                    activo: true
                }
            })

            const tratamiento = await TratamientoParticular.findOne({
                where: {
                    id: turno['dataValues']['fk_idTratamiento'],
                    fk_idPersonaJuridica: turno['dataValues']['fk_idPersonaJuridica'],
                    activo: true
                }
            });

            const institucion = await PersonaJuridica.findOne({
                where: {
                    id: turno['dataValues']['fk_idPersonaJuridica'],
                    activo: true
                }
            });

            const response = {
                id: turno['dataValues']['id'],
                horario: turno['dataValues']['horario'],
                fk_idPaciente: turno['dataValues']['fk_idPaciente'],
                fk_idPersonaJuridica: turno['dataValues']['fk_idPersonaJuridica'],
                monto: turno['dataValues']['monto'],
                fk_idTratamiento: turno['dataValues']['fk_idTratamiento'],
                estado: turno['dataValues']['estado'],
                obraSocial: turno['dataValues']['obraSocial'],
                plan: turno['dataValues']['plan'],
                nombrePersonaJuridica: institucion ? institucion['dataValues']['nombre'] : null,
                tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null,
                paciente: paciente ? `${paciente['dataValues']['apellido']}, ${paciente['dataValues']['nombre']}` : null
            }

            res.status(200).json(response);

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    verificarHorasBeforeTurno: async (req: Request, res: Response) => {

        try {

            const { idTurno } = req.params;
            const turno = await Turno.findByPk(idTurno);

            if (!turno) { throw new Error("No existe el turno solicitado.") }

            const dateTurno = new Date(turno['dataValues']['horario']).getTime();
            const today = new Date();
            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + 3, today.getMinutes(), today.getSeconds());

            //129600 seg -> 36 horas
            const difDates = (dateTurno - todayUTC) / 1000;

            if (difDates < 129600) {
                return res.status(500).json({
                    msg: "No fue posible modificar el turno. El mismo debe modificarse con 36 horas de anterioridad como máximo.",
                    bandera: false
                })
            }

            res.status(200).json({
                msg: "Modificación aceptada.",
                bandera: true
            })


        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    modificarTurno: async (req: Request, res: Response) => {

        try {

            const { idTurno } = req.params;
            const { horario,
                idTratamientoParticular,
                monto,
                nombrePersonaJuridica,
                idPersonaJuridica } = req.body;

            const turnoToEdit = await Turno.findByPk(idTurno);

            if (!turnoToEdit) { throw new Error("No existe el turno solicitado.") }

            if (turnoToEdit['dataValues']['estado'] != "confirmado") {
                throw new Error("No fue posible modificar el turno ya que el mismo fue cancelado.")
            }

            await turnoToEdit.update({
                horario: horario,
                fk_idTratamiento: idTratamientoParticular,
                fk_idPersonaJuridica: idPersonaJuridica,
                monto: monto
            })

            const tratamiento = await TratamientoParticular.findOne({
                where: {
                    id: turnoToEdit['dataValues']['fk_idTratamiento'],
                    fk_idPersonaJuridica: turnoToEdit['dataValues']['fk_idPersonaJuridica'],
                    activo: true
                }
            });

            const response = {
                id: turnoToEdit['dataValues']['id'],
                horario: turnoToEdit['dataValues']['horario'],
                fk_idPaciente: turnoToEdit['dataValues']['fk_idPaciente'],
                fk_idPersonaJuridica: turnoToEdit['dataValues']['fk_idPersonaJuridica'],
                monto: turnoToEdit['dataValues']['monto'],
                fk_idTratamiento: turnoToEdit['dataValues']['fk_idTratamiento'],
                estado: turnoToEdit['dataValues']['estado'],
                obraSocial: turnoToEdit['dataValues']['obraSocial'],
                plan: turnoToEdit['dataValues']['plan'],
                nombrePersonaJuridica,
                tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
            }

            res.status(200).json({
                msg: "Turno actualizado con éxito.",
                turno: response
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    cancelarTurno: async (req: Request, res: Response) => {

        try {

            const { idTurno } = req.params;

            const turnoToCancel = await Turno.findByPk(idTurno);

            if (!turnoToCancel) { throw new Error("No existe el turno solicitado.") }

            await turnoToCancel.update({ estado: "cancelado" })

            res.status(200).json({
                msg: "Turno cancelado con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getAllTurnosInstitucion: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params;

            const turnos = await Turno.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            if (!turnos) {
                throw new Error("La insitución no posee turnos.")
            }

            const turnosResponse = []
            for (let index = 0; index < turnos.length; index++) {

                const paciente = await Paciente.findOne({
                    where: {
                        id: turnos[index]['dataValues']['fk_idPaciente'],
                        activo: true
                    }
                })

                if (!paciente) { continue }

                const tratamiento = await TratamientoParticular.findOne({
                    where: {
                        id: turnos[index]['dataValues']['fk_idTratamiento'],
                        fk_idPersonaJuridica: turnos[index]['dataValues']['fk_idPersonaJuridica'],
                        activo: true
                    }
                });

                const turnoResponse = {
                    id: turnos[index]['dataValues']['id'],
                    horario: turnos[index]['dataValues']['horario'],
                    fk_idPaciente: turnos[index]['dataValues']['fk_idPaciente'],
                    fk_idPersonaJuridica: turnos[index]['dataValues']['fk_idPersonaJuridica'],
                    monto: turnos[index]['dataValues']['monto'],
                    fk_idTratamiento: turnos[index]['dataValues']['fk_idTratamiento'],
                    estado: turnos[index]['dataValues']['estado'],
                    obraSocial: turnos[index]['dataValues']['obraSocial'],
                    plan: turnos[index]['dataValues']['plan'],
                    tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null,
                    paciente: `${paciente['dataValues']['apellido']}, ${paciente['dataValues']['nombre']}`
                }

                turnosResponse.push(turnoResponse);
            }

            res.status(200).json(turnosResponse);

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarTurnoFromInstitucion: async (req: Request, res: Response) => {

        try {

            const { idTurno } = req.params;

            const turnoToDelete = await Turno.findByPk(idTurno);
            if (!turnoToDelete) { throw new Error("No existe el turno solicitado.") }

            const paciente = await Paciente.findOne({
                where: {
                    id: turnoToDelete['dataValues']['fk_idPaciente'],
                    activo: true
                }
            })

            if (!paciente) {
                throw new Error("No existe un paciente relacionado al turno solicitado.")
            }

            let pacienteConUsuario: boolean = false;

            paciente['dataValues']['fk_idUsuario'] ? pacienteConUsuario = true : pacienteConUsuario = false;

            await Turno.destroy({
                where: {
                    id: idTurno
                }
            });

            if (paciente['dataValues']['fk_idUsuario']) {
                const usuario = await Usuario.findByPk(paciente['dataValues']['fk_idUsuario']);

                if (usuario && usuario['dataValues']['subscription']) {
                    const notificationBody = `Te informamos que el turno agendado para el ${turnoToDelete['dataValues']['horario']} ha sido cancelado por la institución.`;

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuario['dataValues']['id'],
                        titulo: "Cancelación de turno",
                        router: `a definir`
                    })

                    sendNotification(usuario['dataValues']['subscription'], notificationBody)
                }
            }

            res.status(200).json({
                msg: "Turno eliminado correctamente.",
                pacienteConUsuario
            });

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getHorariosInstitucion: async (req: Request, res: Response) => {

        try{

            const {idInstitucion} = req.params;





        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default turnosController;