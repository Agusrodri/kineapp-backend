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
            const { horario, idTratamientoParticular, monto, nombrePersonaJuridica } = req.body;

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
                estado: "confirmado"
            })

            const response = {
                id: newTurno['dataValues']['id'],
                horario: newTurno['dataValues']['horario'],
                fk_idPaciente: newTurno['dataValues']['fk_idPaciente'],
                fk_idPersonaJuridica: newTurno['dataValues']['fk_idPersonaJuridica'],
                monto: newTurno['dataValues']['monto'],
                fk_idTratamiento: newTurno['dataValues']['fk_idTratamiento'],
                estado: newTurno['dataValues']['estado'],
                nombrePersonaJuridica
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

                const response = {
                    id: turnos[index]['dataValues']['id'],
                    horario: turnos[index]['dataValues']['horario'],
                    fk_idPaciente: turnos[index]['dataValues']['fk_idPaciente'],
                    fk_idPersonaJuridica: turnos[index]['dataValues']['fk_idPersonaJuridica'],
                    monto: turnos[index]['dataValues']['monto'],
                    fk_idTratamiento: turnos[index]['dataValues']['fk_idTratamiento'],
                    estado: turnos[index]['dataValues']['estado'],
                    nombrePersonaJuridica: institucion['dataValues']['nombre']
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
                nombrePersonaJuridica: institucion ? institucion['dataValues']['nombre'] : null,
                tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
            }

            res.status(200).json(response)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default turnosController;