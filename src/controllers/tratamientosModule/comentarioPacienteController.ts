import { Request, Response } from 'express';
import Paciente from '../../models/entities/usersModule/paciente';
import ComentarioPaciente from '../../models/entities/tratamientosModule/comentarioPaciente';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';

const comentarioPacienteController = {

    getInstitucionesPaciente: async (req: Request, res: Response) => {

        try {

            const { idPaciente } = req.params;

            const pjPacientes = await PersonaJuridicaPaciente.findAll({
                where: {
                    fk_idPaciente: idPaciente,
                    activo: true
                }
            });

            if (!pjPacientes) {
                throw new Error("El paciente no asistió a ninguna institución.")
            }

            const institucionesResponse = [];

            for (let i = 0; i < pjPacientes.length; i++) {
                const institucion = await PersonaJuridica.findOne({
                    where: {
                        id: pjPacientes[i]['dataValues']['fk_idPersonaJuridica'],
                        activo: true
                    }
                })

                if (institucion) {
                    institucionesResponse.push(institucion)
                }
            }

            res.status(200).json(institucionesResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getComentariosInstitucion: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente } = req.params;

            const comentarios = await ComentarioPaciente.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            if (!comentarios) {
                throw new Error("La institución no posee comentarios.")
            }

            const comentariosGenerales = [];
            const comentariosPaciente = [];

            for (let i = 0; i < comentarios.length; i++) {

                if (comentarios[i]['dataValues']['fk_idPaciente'] == idPaciente) {
                    comentariosPaciente.push(comentarios[i])
                } else {
                    comentariosGenerales.push(comentarios[i])
                }
            }

            res.status(200).json({
                comentariosGenerales,
                comentariosPaciente
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    agregarComentario: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente } = req.params;
            const { puntuacion, comentario } = req.body;

            const pacienteToFind = await Paciente.findOne({
                where: {
                    id: idPaciente,
                    activo: true
                }
            })

            if (!pacienteToFind) {
                throw new Error("No existe el paciente solicitado.")
            }

            const comentarioPaciente = await ComentarioPaciente.create({
                puntuacion: puntuacion,
                comentario: comentario,
                fk_idPaciente: idPaciente,
                fk_idPersonaJuridica: idPersonaJuridica,
                fecha: ((new Date()).toISOString()).split("T")[0],
                paciente: `${pacienteToFind['dataValues']['apellido']}, ${pacienteToFind['dataValues']['nombre']}`
            })

            res.status(200).json({
                msg: "Comentario enviado con éxito.",
                comentarioPaciente
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default comentarioPacienteController;