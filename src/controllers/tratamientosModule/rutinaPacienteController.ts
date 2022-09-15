import { Request, Response } from 'express';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';

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
    }

}

export default rutinaPacienteController;