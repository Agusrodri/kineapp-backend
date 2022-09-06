import { Request, Response } from 'express';
import moment from 'moment'
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';

const tratamientoPacienteController = {

    getAllTratamientos: async (req: Request, res: Response) => {

        try{

            const { idPersonaJuridica, idPaciente } = req.params
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente solicitado dentro de la institución.")
            }

            const tratamientosPaciente = await TratamientoPaciente.findAll({
                where:{
                    fk_idPaciente: idPaciente,
                    activo: true
                }
            })

            const tratamientosPacienteResp = []
            for(let i=0; i<tratamientosPaciente.length; i++){

                const tratamientoParticular = await TratamientoParticular.findOne({
                    where: {
                        id: tratamientosPaciente[i]['dataValues']['fk_idTratamiento'],
                        fk_idPersonaJuridica: idPersonaJuridica,
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
                    tratamiento: tratamientoParticular['dataValues']['nombre'],
                    nombrePaciente: tratamientosPaciente[i]['dataValues']['nombrePaciente'],
                    finalizado: tratamientosPaciente[i]['dataValues']['finalizado'],
                    activo: tratamientosPaciente[i]['dataValues']['activo']

                }

                tratamientosPacienteResp.push(tratamientoPaciente)

            }
            res.status(200).json(tratamientosPacienteResp)
        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    agregarTratamientoPaciente: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente } = req.params
            const { nombrePaciente, idTratamientoParticular, fechaInicio, fechaFinEstimada } = req.body
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente solicitado dentro de la institución.")
            }

            const tratamientoParticular = await TratamientoParticular.findOne({
                where: {
                    id: idTratamientoParticular,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!tratamientoParticular) {
                throw new Error("No se encuentra el tratamiento particular solicitado.")
            }

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idTratamiento: idTratamientoParticular,
                    activo: true,
                    finalizado: false
                }
            })

            if (tratamientoPaciente) {
                throw new Error("El paciente ya se encuentra realizando este tratamiento.")
            }

            const newTratamientoPaciente = await TratamientoPaciente.create({
                fechaInicio: fechaInicio,
                fechaFinEstimada: fechaFinEstimada,
                fechaFinReal: null,
                fk_idPaciente: idPaciente,
                fk_idTratamiento: idTratamientoParticular,
                nombrePaciente: nombrePaciente,
                finalizado: false,
                activo: true
            })

            const response = {
                id: newTratamientoPaciente['dataValues']['id'],
                fechaInicio: newTratamientoPaciente['dataValues']['fechaInicio'],
                fechaFinEstimada: newTratamientoPaciente['dataValues']['fechaFinEstimada'],
                fechaFinReal: newTratamientoPaciente['dataValues']['fechaFinReal'],
                idPaciente: newTratamientoPaciente['dataValues']['fk_idPaciente'],
                fk_idTratamiento: newTratamientoPaciente['dataValues']['fk_idTratamiento'],
                tratamiento: tratamientoParticular['dataValues']['nombre'],
                nombrePaciente: newTratamientoPaciente['dataValues']['nombrePaciente'],
                finalizado: newTratamientoPaciente['dataValues']['finalizado'],
                activo: newTratamientoPaciente['dataValues']['activo']
            }

            res.status(200).json({
                msg: "Tratamiento agregado con éxito.",
                newTratamientoPaciente: response
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTratamientoAsignado: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente, idTratamientoPaciente } = req.params
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente solicitado dentro de la institución.")
            }

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    fk_idPaciente: idPaciente
                    //no se coloca activo porque puede solicitar visualizar un tratamiento ya finalizado
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("El paciente no posee asignado el tratamiento solicitado.")
            }

            const tratamientoParticular = await TratamientoParticular.findOne({
                where:{
                    id: tratamientoPaciente['dataValues']['fk_idTratamiento'],
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            const response = {
                id: tratamientoPaciente['dataValues']['id'],
                fechaInicio: tratamientoPaciente['dataValues']['fechaInicio'],
                fechaFinEstimada: tratamientoPaciente['dataValues']['fechaFinEstimada'],
                fechaFinReal: tratamientoPaciente['dataValues']['fechaFinReal'],
                idPaciente: tratamientoPaciente['dataValues']['fk_idPaciente'],
                fk_idTratamiento: tratamientoPaciente['dataValues']['fk_idTratamiento'],
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

    finalizarTratamiento: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente, idTratamientoPaciente } = req.params
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente solicitado dentro de la institución.")
            }

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    fk_idPaciente: idPaciente,
                    activo: true,
                    finalizado: false
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("El paciente no posee asignado el tratamiento solicitado. El mismo se encuentra en curso o ya finalizó.")
            }

            const nuevaFechaFinReal = (new Date()).toISOString().split("T")[0]
            //const fechaMoment = moment().format()
            
            //console.log("Nueva fecha: ", nuevaFechaFinReal)
            await tratamientoPaciente.update({ fechaFinReal: nuevaFechaFinReal, finalizado: true })

            res.status(200).json({
                msg: "Tratamiento finalizado con éxito.",
                tratamientoPacienteFinalizado: tratamientoPaciente
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarTratamiento: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente, idTratamientoPaciente } = req.params
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente solicitado dentro de la institución.")
            }

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    fk_idPaciente: idPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("El paciente no posee asignado el tratamiento solicitado.")
            }

            if (tratamientoPaciente['dataValues']['finalizado'] === true) {

                await tratamientoPaciente.update({ activo: false })
                res.status(200).json({
                    msg: "Tratamiento eliminado con éxito."
                })

            } else {

                await tratamientoPaciente.update({ fechaFinReal: new Date(), activo: false })
                res.status(200).json({
                    msg: "Tratamiento eliminado y finalizado con éxito."
                })
            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}

export default tratamientoPacienteController;