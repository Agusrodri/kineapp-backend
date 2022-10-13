import { Request, Response } from 'express';
import PlanTratamientoGeneral from '../../models/entities/obrasSocialesModule/planTratamientoGeneral';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import ConfiguracionTurnos from '../../models/entities/turnosModule/configuracionTurnos';
import Turno from '../../models/entities/turnosModule/turno';
import Paciente from '../../models/entities/usersModule/paciente';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';

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
                nombrePersonaJuridica,
                obraSocial,
                plan } = req.body;

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

            if (!configTurnos && turnosToFind && turnosToFind.length >= 1) {
                throw new Error("Horario ocupado.")
            }

            if (configTurnos && turnosToFind && turnosToFind.length >= configTurnos['dataValues']['pacientesSimultaneos']) {
                throw new Error("Horario ocupado.")
            }

            const newTurno = await Turno.create({
                horario: horario,
                fk_idPaciente: Number(idPaciente),
                fk_idPersonaJuridica: Number(idPersonaJuridica),
                monto: monto,
                fk_idTratamiento: idTratamientoParticular,
                estado: "confirmado",
                obraSocial: obraSocial,
                plan: plan
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
                obraSocial: newTurno['dataValues']['obraSocial'],
                plan: newTurno['dataValues']['plan'],
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
                tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
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
                throw new Error("No fue posible modificar el turno. El mismo debe modificarse con 36 horas de anterioridad como máximo.")
            }

            res.status(200).json({
                msg: "Modificación aceptada."
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
                    tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
                }

                turnosResponse.push(turnoResponse);
            }

            res.status(200).json(turnosResponse);

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default turnosController;