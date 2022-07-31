import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import Profesional from '../../models/entities/usersModule/profesional';
import PersonaJuridicaProfesional from '../../models/entities/usersModule/personaJuridicaProfesional';
import RolInterno from '../../models/entities/usersModule/rolInterno';
import Usuario from '../../models/entities/usersModule/usuario';
import sendEmail from '../../helpers/send-email';
import Paciente from '../../models/entities/usersModule/paciente';

const profesionalesController = {

    getProfesionales: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const pjProfesionales = await PersonaJuridicaProfesional.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            if (pjProfesionales.length == 0) {
                throw new Error("No existen profesionales cargados.")
            }

            const profesionalesResponse = []

            for (let i = 0; i < pjProfesionales.length; i++) {

                const profesional = await Profesional.findOne({
                    where: {
                        id: pjProfesionales[i]['dataValues']['fk_idProfesional'],
                        activo: true
                    }
                })

                const rolInterno = await RolInterno.findByPk(pjProfesionales[i]['dataValues']['fk_idRolInterno'])

                const profesionalResponse = {
                    id: profesional['dataValues']['id'],
                    nombre: profesional['dataValues']['nombre'],
                    apellido: profesional['dataValues']['apellido'],
                    dni: profesional['dataValues']['dni'],
                    tipoDNI: profesional['dataValues']['tipoDNI'],
                    fechaNacimiento: profesional['dataValues']['fechaNacimiento'],
                    numeroMatricula: profesional['dataValues']['numeroMatricula'],
                    nivelEducativo: profesional['dataValues']['nivelEducativo'],
                    rol: rolInterno['dataValues']['nombreRol']
                }

                profesionalesResponse.push(profesionalResponse)
            }

            res.status(200).json(profesionalesResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getProfesionalById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idProfesional } = req.params

            //verificar que el profesional pertenezca a la institución
            const pjProfesional = await PersonaJuridicaProfesional.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idProfesional: idProfesional
                }
            })

            if (!pjProfesional) {
                throw new Error("No existe el profesional solicitado.")
            }

            //obtener profesional
            const profesional = await Profesional.findOne({
                where: {
                    id: idProfesional,
                    activo: true
                }
            })

            if (!profesional) {
                throw new Error("No existe el profesional solicitado.")
            }

            //buscar rol interno
            const idRolInterno = pjProfesional['dataValues']['fk_idRolInterno']
            const rolInternoProfesional = await RolInterno.findByPk(idRolInterno)
            const nombreRolInterno = rolInternoProfesional['dataValues']['nombreRol']

            //buscar usuario para obtener email
            const idUsuario = profesional['dataValues']['fk_idUsuario']
            const usuarioProfesional = await Usuario.findByPk(idUsuario)
            const emailProfesional = usuarioProfesional['dataValues']['email']
            const telefonoProfesional = usuarioProfesional['dataValues']['telefono']

            //response final
            const profesionalResponse = {
                nombre: profesional['dataValues']['nombre'],
                apellido: profesional['dataValues']['apellido'],
                dni: profesional['dataValues']['dni'],
                tipoDNI: profesional['dataValues']['tipoDNI'],
                fechaNacimiento: profesional['dataValues']['fechaNacimiento'],
                numeroMatricula: profesional['dataValues']['numeroMatricula'],
                nivelEducativo: profesional['dataValues']['nivelEducativo'],
                rol: nombreRolInterno,
                email: emailProfesional,
                telefono: telefonoProfesional
            }

            res.status(200).json(profesionalResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    crearProfesionalSinUsuario: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            const { nombre,
                apellido,
                dni,
                tipoDNI,
                fechaNacimiento,
                numeroMatricula,
                nivelEducativo,
                idRol,
                email,
                telefono,
                link } = req.body

            //crear usuario del nuevo profesional 
            const nuevoUsuarioProfesional = await Usuario.create({
                email: email,
                telefono: telefono
            })

            //crear profesional y asociarlo al usuario creado previamente
            const nuevoProfesional = await Profesional.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                tipoDNI: tipoDNI,
                fechaNacimiento: fechaNacimiento,
                numeroMatricula: numeroMatricula,
                nivelEducativo: nivelEducativo,
                fk_idUsuario: nuevoUsuarioProfesional['dataValues']['id'],
                activo: true
            })

            //asociar profesional con la institución y setear el rol interno que posee el profesional
            await PersonaJuridicaProfesional.create({
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idProfesional: nuevoProfesional['dataValues']['id'],
                fk_idRolInterno: idRol
            })

            const idUsuario = nuevoUsuarioProfesional['dataValues']['id']
            const idProfesional = nuevoProfesional['dataValues']['id']

            const nuevoLink = `${link}/${idUsuario}/${idProfesional}`

            //enviar email
            await sendEmail(nuevoLink, email)

            res.status(200).json({
                msg: "Profesional creado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    validarProfesional: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params
            const { password } = req.body
            const usuarioToUpdate = await Usuario.findByPk(idUsuario)
            const salt = bcrypt.genSaltSync(12);
            const encriptedPassword = bcrypt.hashSync(password, salt);

            await usuarioToUpdate.update({ password: encriptedPassword })

            res.status(200).json({
                msg: `Contraseña del usuario agregada con éxito.`
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    buscarUsuario: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { email } = req.body

            //verificar si el email corresponde a un usuario
            const usuarioToFind = await Usuario.findOne({
                where: {
                    email: email
                }
            })

            if (!usuarioToFind) {
                throw new Error("El email ingresado no coincide con ningún usuario del sistema.")
            }

            const idUsuarioEncontrado = usuarioToFind['dataValues']['id']

            //verificar si el email pertenece a un profesional 
            const profesionalToFind = await Profesional.findOne({
                where: {
                    fk_idUsuario: idUsuarioEncontrado
                }
            })

            if (profesionalToFind) {
                //verificar si el email pertenece a un profesional de la institucion
                const profesionalInstitucion = await PersonaJuridicaProfesional.findOne({
                    where: {
                        fk_idPersonaJuridica: idPersonaJuridica,
                        fk_idProfesional: profesionalToFind['dataValues']['id']
                    }
                })

                if (profesionalInstitucion) {
                    throw new Error("El email ingresado ya corresponde a un profesional de la institución indicada.")
                } else {
                    const { nombre, apellido, dni, tipoDNI, fechaNacimiento, numeroMatricula, nivelEducativo } = profesionalToFind['dataValues']
                    res.status(200).json({
                        msg: "El email ingresado pertenece a un profesional existente en el sistema.",
                        idUsuario: idUsuarioEncontrado,
                        nombre,
                        apellido,
                        dni,
                        tipoDNI,
                        fechaNacimiento,
                        numeroMatricula,
                        nivelEducativo
                    })
                }
            } else {
                //verificar si el email pertenece a un paciente
                const pacienteToFind = await Paciente.findOne({
                    where: {
                        fk_idUsuario: idUsuarioEncontrado
                    }
                })

                if (!pacienteToFind) {
                    throw new Error("El email ingresado no coincide con ningún usuario del sistema.")
                }

                const { nombre, apellido, dni, tipoDNI, fechaNacimiento } = pacienteToFind['dataValues']

                res.status(200).json({
                    msg: "El email ingresado pertenece a un paciente existente en el sistema.",
                    idUsuario: idUsuarioEncontrado,
                    nombre,
                    apellido,
                    dni,
                    tipoDNI,
                    fechaNacimiento
                })
            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    crearProfesionalConUsuario: async (req: Request, res: Response) => {

        try {

            const { idUsuario, idPersonaJuridica } = req.params
            const { nombre, apellido, dni, tipoDNI, fechaNacimiento, numeroMatricula, nivelEducativo, idRol } = req.body

            //crear profesional y asociarlo al usuario 
            const nuevoProfesional = await Profesional.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                tipoDNI: tipoDNI,
                fechaNacimiento: fechaNacimiento,
                numeroMatricula: numeroMatricula,
                nivelEducativo: nivelEducativo,
                fk_idUsuario: idUsuario,
                activo: true
            })

            //asociar profesional con la institución y setear el rol interno que posee el profesional
            await PersonaJuridicaProfesional.create({
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idProfesional: nuevoProfesional['dataValues']['id'],
                fk_idRolInterno: idRol
            })

            res.status(200).json({
                msg: "Profesional creado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default profesionalesController