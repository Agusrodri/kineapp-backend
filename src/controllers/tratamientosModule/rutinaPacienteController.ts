import { Request, Response } from 'express';
import Rutina from '../../models/entities/tratamientosModule/rutina';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import RutinaEjercicio from '../../models/entities/tratamientosModule/rutinaEjercicio';
import { Op } from 'sequelize';

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

        try{

            const {idRutina} = req.params
            const ejercicios = req.body
            const rutina = await Rutina.findOne({
                where:{
                    id: idRutina,
                    activo: true,
                    finalizada: false
                }
            })

            if(!rutina){
                throw new Error("No se encontró la rutina solicitada.")
            }

            const rutinaEjercicioRes = []

            for(let i=0; i<ejercicios.length; i++){
                const rutinaEjercicio = await RutinaEjercicio.findOne({
                    where:{
                        fk_idRutina: idRutina,
                        fk_idEjercicio: ejercicios[i]['id']
                    }
                })
                await rutinaEjercicio.update({contadorCheck: ejercicios[i]['contadorCheck']})
                rutinaEjercicioRes.push(rutinaEjercicio)
            }

            const response = {
                id: rutina['dataValues']['id'],
                orden: rutina['dataValues']['orden'],
                idTratamientoPaciente: rutina['dataValues']['fk_idTratamientoPaciente'],
                activo: rutina['dataValues']['activo'],
                finalizada: rutina['dataValues']['finalizada'],
                fechaFinalizacion: rutina['dataValues']['fechaFinalizacion'],
                rutinaEjercicios: rutinaEjercicioRes
            } 

            res.status(200).json(response)


        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default rutinaPacienteController;