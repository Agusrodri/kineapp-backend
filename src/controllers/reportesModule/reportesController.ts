import { Request, Response } from 'express';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';
import { Op } from 'sequelize';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import ComentarioPaciente from '../../models/entities/tratamientosModule/comentarioPaciente';

const reportesController = {

    generarReportes: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params;
            const { anio,
                mes,
                cantidadTratamientosFinalizados,
                cantidadPacientesNuevos,
                cantidadPacientesPorTratamiento,
                puntajeInstitucion } = req.body;

            const response = {
                cantidadTratamientosFinalizados: null,
                cantidadPacientesNuevos: null,
                cantidadPacientesPorTratamiento: [],
                puntajeInstitucion: []
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
                    console.log(auxMes)
                    console.log(anio)
                    const comentariosPaciente = await ComentarioPaciente.findAll({
                        where: {
                            fk_idPersonaJuridica: idPersonaJuridica,
                            createdAt: {
                                [Op.between]: [new Date(`${anio}-${auxMes}-01`), new Date(`${anio}-${auxMes}-31`)]
                            }
                        }
                    })

                    console.log(comentariosPaciente)

                    const puntajesMes = []
                    if (comentariosPaciente) {
                        for (let i = 0; i < comentariosPaciente.length; i++) {
                            puntajesMes.push(comentariosPaciente[i]['dataValues']['puntuacion'])
                        }
                    }

                    const promedioPuntajeMes = puntajesMes.reduce((a, b) => a + b, 0) / puntajesMes.length;
                    const puntajeMesResponse = {
                        mes: auxMes < 10 ? `0${auxMes}` : `${auxMes}`,
                        puntaje: promedioPuntajeMes
                    }

                    response.puntajeInstitucion.push(puntajeMesResponse)
                    auxMes -= 1;
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