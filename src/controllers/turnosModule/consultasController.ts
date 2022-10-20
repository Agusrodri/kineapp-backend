import { Request, Response } from 'express';
import Turno from '../../models/entities/turnosModule/turno';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import { Op } from 'sequelize';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import Paciente from '../../models/entities/usersModule/paciente';
import Consulta from '../../models/entities/turnosModule/consulta';

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

    crearConsulta: async (req: Request, res: Response) => {

        try{

            const {idTurno} = req.params;
            const {observaciones, asistio} = req.body;

            const consulta = await Consulta.findOne({
                where:{
                    fk_idTurno: idTurno
                }
            })

            if(consulta){
                throw new Error("El turno ya posee una consulta asociada.")
            }

            const newConsulta = await Consulta.create({
                fk_idTurno: idTurno,
                observaciones: observaciones,
                asistio: asistio
            })

            res.status(200).json({
                msg: "Consulta guardada con éxito.",
                consulta: newConsulta
            })

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    confirmarTurno: async (req: Request, res: Response) => {

        try{

            const {idTurno} = req.params;
            const turno = await Turno.findOne({
                where:{
                    id: idTurno
                }
            });

            if(!turno){
                throw new Error("No existe el turno solicitado.")
            }

            if(turno['dataValues']['estado'] == "cancelado"){
                throw new Error("El turno ya se encuentra cancelado.")
            }

            await turno.update({estado: "confirmado"});

            res.status(200).json({
                msg: "Turno confirmado con éxito."
            })
            
        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}

export default consultasController;