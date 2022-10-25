import { Request, Response } from 'express';
import Turno from '../../models/entities/turnosModule/turno';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import { Op } from 'sequelize';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import Paciente from '../../models/entities/usersModule/paciente';
import Consulta from '../../models/entities/turnosModule/consulta';
import Profesional from '../../models/entities/usersModule/profesional';
import Usuario from '../../models/entities/usersModule/usuario';
import Notificacion from '../../models/entities/usersModule/notificacion';
import sendNotification from '../../helpers/sendNotification';

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
            const {observaciones, asistio, idProfesional} = req.body;

            const turno = await Turno.findByPk(idTurno);
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
                asistio: asistio,
                fk_idProfesional: idProfesional
            })

            if(asistio == true){
                await turno.update({estado: "asistido"})
                const profesional = await Profesional.findByPk(idProfesional);

                const paciente = turno? await Paciente.findOne({
                    where:{
                        id: turno['dataValues']['fk_idPaciente'],
                        activo: true
                    }
                }): null;

                const usuarioToFind = paciente && paciente['dataValues']['fk_idUsuario'] ? 
                    await Usuario.findByPk(paciente['dataValues']['fk_idUsuario']) : null;

                const nombreProfesional = profesional ? `${profesional['dataValues']['apellido']}, ${profesional['dataValues']['nombre']}`: "";
                const notificationBody = `Hoy te atendió ${nombreProfesional}. ¿Qué puntuación le darías?`;
                if (usuarioToFind) {

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuarioToFind['dataValues']['id'],
                        titulo: "Califica al profesional",
                        router: "a definir"
                    })

                    sendNotification(usuarioToFind['dataValues']['subscription'], notificationBody);
                    return true;
                }
            }else{
                await turno.update({estado: "no-asistido"})
            }

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
    },

    getConsultas: async (req: Request, res: Response) => {

        try{

            const {idPaciente} = req.params;

            const paciente = await Paciente.findOne({
                where:{
                    id: idPaciente,
                    activo: true
                }
            })

            if(!paciente){
                throw new Error("No existe el paciente solicitado.")
            }

            const turnos = await Turno.findAll({
                where:{
                    fk_idPaciente: idPaciente
                }
            })

            if (!turnos){
                return res.status(200).json([])
            }

            const consultasResponse = [];
            
            for (let index = 0; index < turnos.length; index++) {
                
                const consulta = await Consulta.findOne({
                    where:{
                        fk_idTurno: turnos[index]['dataValues']['id'],
                        asistio: true
                    }
                })

                if(!consulta){continue}

                const tratamiento = await TratamientoParticular.findByPk(turnos[index]['dataValues']['fk_idTratamiento']);
                const profesional = await Profesional.findByPk(consulta['dataValues']['fk_idProfesional']);

                const consultaToAdd = {
                    id: consulta['dataValues']['id'],
                    observaciones: consulta['dataValues']['observaciones'],
                    puntuacion: consulta['dataValues']['puntuacion'] ? consulta['dataValues']['puntuacion']: null,
                    paciente: `${paciente['dataValues']['apellido']}, ${paciente['dataValues']['nombre']}`,
                    horario: turnos[index]['dataValues']['horario'],
                    tratamiento: tratamiento ? tratamiento['dataValues']['nombre']: null,
                    profesional: profesional ? `${profesional['dataValues']['apellido']}, ${profesional['dataValues']['nombre']}`: null
                }

                consultasResponse.push(consultaToAdd);
            }

            res.status(200).json(consultasResponse);

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getConsultaById: async (req: Request, res: Response) => {

        try{

            const {idConsulta} = req.params;
            const consulta = await Consulta.findByPk(idConsulta);

            if(!consulta){
                throw new Error("No existe la consulta solicitada.")
            }

            const turno = await Turno.findByPk(consulta['dataValues']['fk_idTurno']);

            if(!turno){
                throw new Error("La consulta no posee un turno asociado.")
            }

            const paciente = await Paciente.findOne({
                where:{
                    id: turno['dataValues']['fk_idPaciente'],
                    activo: true
                }
            });

            const tratamiento = await TratamientoParticular.findByPk(turno['dataValues']['fk_idTratamiento']);
            const profesional = await Profesional.findByPk(consulta['dataValues']['fk_idProfesional']);

            const consultaResponse = {
                id: consulta['dataValues']['id'],
                observaciones: consulta['dataValues']['observaciones'],
                puntuacion: consulta['dataValues']['puntuacion'] ? consulta['dataValues']['puntuacion']: null,
                paciente: paciente? `${paciente['dataValues']['apellido']}, ${paciente['dataValues']['nombre']}`: null,
                horario: turno['dataValues']['horario'],
                tratamiento: tratamiento ? tratamiento['dataValues']['nombre']: null,
                profesional: profesional ? `${profesional['dataValues']['apellido']}, ${profesional['dataValues']['nombre']}`: null
            }

            res.status(200).json(consultaResponse)

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    calificarProfesional: async (req: Request, res: Response) => {

        try{

            const {idConsulta} = req.params;
            const {puntuacion} = req.body;

            const consulta = await Consulta.findByPk(idConsulta);

            if(!consulta){
                throw new Error("No existe la consulta solicitada.")
            }

            await consulta.update({puntuacion: puntuacion});

            res.status(200).json({
                msg: "Puntaje establecido con éxito."
            })

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default consultasController;