import { Request, Response } from 'express';
import Turno from '../../models/entities/turnosModule/turno';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import { Op } from 'sequelize';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import Paciente from '../../models/entities/usersModule/paciente';

const consultasController = {

    getTurnosDay: async (req: Request, res: Response) => {

        try{

            const {idPersonaJuridica} = req.params;
            const {fecha} = req.body;

            const institucion = await PersonaJuridica.findOne({
                where:{
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            if(!institucion){
                throw new Error("No existe la institución solicitada.")
            }

            const turnosDay = await Turno.findAll({
                where:{
                    horario:{
                        [Op.like]: `${fecha}%`
                    },
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            }) 

            if(!turnosDay){
                return res.status(200).json([])
            }

            const responsesArray = []
            for (let index = 0; index < turnosDay.length; index++) {

                const paciente = await Paciente.findByPk(turnosDay[index]['dataValues']['fk_idPaciente'])

                const tratamiento = await TratamientoParticular.findOne({
                    where: {
                        id: turnosDay[index]['dataValues']['fk_idTratamiento'],
                        fk_idPersonaJuridica: turnosDay[index]['dataValues']['fk_idPersonaJuridica'],
                        activo: true
                    }
                });

                const response = {
                    id: turnosDay[index]['dataValues']['id'],
                    horario: turnosDay[index]['dataValues']['horario'],
                    fk_idPaciente: turnosDay[index]['dataValues']['fk_idPaciente'],
                    fk_idPersonaJuridica: turnosDay[index]['dataValues']['fk_idPersonaJuridica'],
                    monto: turnosDay[index]['dataValues']['monto'],
                    fk_idTratamiento: turnosDay[index]['dataValues']['fk_idTratamiento'],
                    estado: turnosDay[index]['dataValues']['estado'],
                    obraSocial: turnosDay[index]['dataValues']['obraSocial'],
                    plan: turnosDay[index]['dataValues']['plan'],
                    nombrePersonaJuridica: institucion['dataValues']['nombre'],
                    paciente: paciente? `${paciente['dataValues']['apellido']}, ${paciente['dataValues']['nombre']}`: null,
                    tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null
                }

                responsesArray.push(response)
            }

            res.status(200).json(responsesArray)

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    confirmarTurno: async (req: Request, res: Response) => {
        
    }

}

export default consultasController;