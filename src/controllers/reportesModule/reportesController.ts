import { Request, Response } from 'express';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';
import { Op } from 'sequelize';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import ComentarioPaciente from '../../models/entities/tratamientosModule/comentarioPaciente';
import Turno from '../../models/entities/turnosModule/turno';
import PersonaJuridicaProfesional from '../../models/entities/usersModule/personaJuridicaProfesional';
import Profesional from '../../models/entities/usersModule/profesional';
import Consulta from '../../models/entities/turnosModule/consulta';

const reportesController = {

    generarReportes: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params;
            const { anio,
                mes,
                cantidadTratamientosFinalizados,
                cantidadPacientesNuevos,
                cantidadPacientesPorTratamiento,
                puntajeInstitucion,
                cantidadTurnosNoAsistidos,
                puntajeCadaProfesional } = req.body;

            const response = {
                cantidadTratamientosFinalizados: null,
                cantidadPacientesNuevos: null,
                cantidadPacientesPorTratamiento: [],
                puntajeInstitucion: [],
                cantidadTurnosNoAsistidos: null,
                puntajeCadaProfesional: []
            }

            if (cantidadTratamientosFinalizados == true) {
                const tratamientosFinalizados = await TratamientoPaciente.findAll({
                    where: {
                        activo: true,
                        fk_idPersonaJuridica: idPersonaJuridica,
                        finalizado: true,
                        fechaFinReal: {
                            [Op.between]: [new Date(`${anio}-${mes}-01`), new Date(`${anio}-${mes}-31`)]
                        }
                    }
                })

                if (tratamientosFinalizados) {
                    response.cantidadTratamientosFinalizados = tratamientosFinalizados.length;
                }
            }

            if (cantidadPacientesNuevos == true) {
                const pacientesNuevos = await PersonaJuridicaPaciente.findAll({
                    where: {
                        fk_idPersonaJuridica: idPersonaJuridica,
                        activo: true,
                        createdAt: {
                            [Op.between]: [new Date(`${anio}-${mes}-01`), new Date(`${anio}-${mes}-31`)]
                        }
                    }
                })

                if (pacientesNuevos) {
                    response.cantidadPacientesNuevos = pacientesNuevos.length;
                }
            }

            if (cantidadPacientesPorTratamiento == true) {

                const tratamientosParticulares = await TratamientoParticular.findAll({
                    where: {
                        fk_idPersonaJuridica: idPersonaJuridica,
                        activo: true
                    }
                })

                if (tratamientosParticulares) {
                    for (let i = 0; i < tratamientosParticulares.length; i++) {

                        const tratamientosPaciente = await TratamientoPaciente.findAll({
                            where: {
                                fk_idTratamiento: tratamientosParticulares[i]['dataValues']['id'],
                                createdAt: {
                                    [Op.between]: [new Date(`${anio}-${mes}-01`), new Date(`${anio}-${mes}-31`)]
                                },
                                activo: true
                            }
                        })

                        const tratamiento = {
                            tratamiento: tratamientosParticulares[i]['dataValues']['nombre'],
                            cantidadPacientes: 0
                        }

                        if (tratamientosPaciente) {
                            tratamiento.cantidadPacientes = tratamientosPaciente.length;
                        }

                        response.cantidadPacientesPorTratamiento.push(tratamiento);
                    }
                }
            }

            if (puntajeInstitucion == true) {

                let auxMes = Number(mes);

                while (auxMes >= 1) {
                    const comentariosPaciente = await ComentarioPaciente.findAll({
                        where: {
                            fk_idPersonaJuridica: idPersonaJuridica,
                            createdAt: {
                                [Op.between]: [new Date(`${anio}-${auxMes}-01`), new Date(`${anio}-${auxMes}-31`)]
                            }
                        }
                    })

                    const puntajesMes = []
                    if (comentariosPaciente) {
                        for (let i = 0; i < comentariosPaciente.length; i++) {
                            puntajesMes.push(comentariosPaciente[i]['dataValues']['puntuacion'])
                        }
                    }

                    const promedioPuntajeMes = puntajesMes.reduce((a, b) => a + b, 0) / puntajesMes.length;
                    const puntajeMesResponse = {
                        mes: auxMes < 10 ? `0${auxMes}` : `${auxMes}`,
                        puntaje: Math.round(promedioPuntajeMes * 100) / 100
                    }

                    response.puntajeInstitucion.push(puntajeMesResponse)
                    auxMes -= 1;
                }
            }

            if (cantidadTurnosNoAsistidos == true) {
                const turnosNoAsistidos = await Turno.findAll({
                    where: {
                        fk_idPersonaJuridica: idPersonaJuridica,
                        estado: "no-asistido",
                        horario: {
                            [Op.like]: `${mes}/%/${anio}%`
                        }
                    }
                })

                if (turnosNoAsistidos) {
                    response.cantidadTurnosNoAsistidos = turnosNoAsistidos.length;
                }
            }

            if (puntajeCadaProfesional == true) {
                const pjProfesional = await PersonaJuridicaProfesional.findAll({
                    where: {
                        fk_idPersonaJuridica: idPersonaJuridica,
                        activo: true
                    }
                })

                if (pjProfesional) {
                    for (let index = 0; index < pjProfesional.length; index++) {
                        const profesional = await Profesional.findByPk(pjProfesional[index]['dataValues']['fk_idProfesional']);
                        const consultas = await Consulta.findAll({
                            where: {
                                fk_idProfesional: pjProfesional[index]['dataValues']['fk_idProfesional'],
                                createdAt: {
                                    [Op.between]: [new Date(`${anio}-${mes}-01`), new Date(`${anio}-${mes}-31`)]
                                }
                            }
                        })

                        let puntajesProfesional = []
                        for (let index = 0; index < consultas.length; index++) {
                            const turno = await Turno.findByPk(consultas[index]['dataValues']['fk_idTurno']);
                            if (turno['dataValues']['fk_idPersonaJuridica'] == idPersonaJuridica) {
                                puntajesProfesional.push(consultas[index]['dataValues']['puntuacion'])
                            }
                        }

                        const promedioPuntajeProfesional = puntajesProfesional.reduce((a, b) => a + b, 0) / puntajesProfesional.length;
                        const profesionalResponse = {
                            profesional: `${profesional['dataValues']['apellido']}, ${profesional['dataValues']['nombre']}`,
                            puntaje: promedioPuntajeProfesional ? promedioPuntajeProfesional : 0
                        }

                        response.puntajeCadaProfesional.push(profesionalResponse);
                    }
                }
            }

            res.status(200).json(response)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default reportesController;