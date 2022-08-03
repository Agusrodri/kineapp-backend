import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import Profesional from '../../models/entities/usersModule/profesional';
import PersonaJuridicaProfesional from '../../models/entities/usersModule/personaJuridicaProfesional';
import RolInterno from '../../models/entities/usersModule/rolInterno';
import Usuario from '../../models/entities/usersModule/usuario';
import sendEmail from '../../helpers/send-email';
import Paciente from '../../models/entities/usersModule/paciente';
import TipoDNI from '../../models/entities/usersModule/tipoDNI';

const profesionalesController = {

    getProfesionales: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const pjProfesionales = await PersonaJuridicaProfesional.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (pjProfesionales.length == 0) {
                throw new Error("No existen profesionales cargados.")
            }

            const profesionalesResponse = []

            for (let i = 0; i < pjProfesionales.length; i++) {

                const profesional = await Profesional.findOne({
                    where: {
                        id: pjProfesionales[i]['dataValues']['fk_idProfesional']
                    }
                })

                const rolInterno = await RolInterno.findByPk(pjProfesionales[i]['dataValues']['fk_idRolInterno'])
                const tipoDNI = await TipoDNI.findByPk(profesional['dataValues']['fk_idTipoDNI'])

                const profesionalResponse = {
                    id: profesional['dataValues']['id'],
                    nombre: profesional['dataValues']['nombre'],
                    apellido: profesional['dataValues']['apellido'],
                    dni: profesional['dataValues']['dni'],
                    tipoDNI: tipoDNI['dataValues']['tipoDNI'],
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
                    fk_idProfesional: idProfesional,
                    activo: true
                }
            })

            if (!pjProfesional) {
                throw new Error("No existe el profesional solicitado.")
            }

            //obtener profesional
            const profesional = await Profesional.findOne({
                where: {
                    id: idProfesional
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

            const tipoDNI = await TipoDNI.findByPk(profesional['dataValues']['fk_idTipoDNI'])

            //response final
            const profesionalResponse = {
                nombre: profesional['dataValues']['nombre'],
                apellido: profesional['dataValues']['apellido'],
                dni: profesional['dataValues']['dni'],
                tipoDNI: tipoDNI['dataValues']['tipoDNI'],
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
                idTipoDNI,
                fechaNacimiento,
                numeroMatricula,
                nivelEducativo,
                idRol,
                email,
                telefono,
                link } = req.body

            //buscar usuario con email existente
            const findUsuario = await Usuario.findOne({
                where: {
                    email: email,
                    activo: true
                }
            })

            if (findUsuario) {
                return res.status(200).json({
                    usuarioExistente: true
                })
            }

            //crear usuario del nuevo profesional 
            const nuevoUsuarioProfesional = await Usuario.create({
                email: email,
                telefono: telefono,
                activo: true
            })

            //crear profesional y asociarlo al usuario creado previamente
            const nuevoProfesional = await Profesional.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                fk_idTipoDNI: idTipoDNI,
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
                fk_idRolInterno: idRol,
                activo: true
            })

            const idUsuario = nuevoUsuarioProfesional['dataValues']['id']
            const idProfesional = nuevoProfesional['dataValues']['id']

            const nuevoLink = `${link}/${idUsuario}/${idProfesional}`

            //enviar email
            await sendEmail(nuevoLink, email)

            res.status(200).json({
                msg: "Profesional creado correctamente.",
                usuarioExistente: false
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
                    email: email,
                    activo: true
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
                        fk_idProfesional: profesionalToFind['dataValues']['id'],
                        activo: true
                    }
                })

                if (profesionalInstitucion) {
                    throw new Error("El email ingresado ya corresponde a un profesional de la institución indicada.")
                } else {
                    const { nombre, apellido, dni, fk_idTipoDNI, fechaNacimiento, numeroMatricula, nivelEducativo } = profesionalToFind['dataValues']
                    res.status(200).json({
                        msg: "El email ingresado pertenece a un profesional existente en el sistema.",
                        idUsuario: idUsuarioEncontrado,
                        nombre,
                        apellido,
                        dni,
                        fk_idTipoDNI,
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

                const { nombre, apellido, dni, fk_idTipoDNI, fechaNacimiento } = pacienteToFind['dataValues']

                res.status(200).json({
                    msg: "El email ingresado pertenece a un paciente existente en el sistema.",
                    idUsuario: idUsuarioEncontrado,
                    nombre,
                    apellido,
                    dni,
                    fk_idTipoDNI,
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
            const { nombre, apellido, dni, idTipoDNI, fechaNacimiento, numeroMatricula, nivelEducativo, idRol } = req.body

            const usuarioActivo = Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true
                }
            })

            if (!usuarioActivo) {
                throw new Error("No existe el usuario solicitado")
            }

            //crear profesional y asociarlo al usuario 
            const nuevoProfesional = await Profesional.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                fk_idTipoDNI: idTipoDNI,
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
                fk_idRolInterno: idRol,
                activo: true
            })

            res.status(200).json({
                msg: "Profesional creado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTiposDni: async (req: Request, res: Response) => {
        try {
            const tipoDnis = await TipoDNI.findAll()
            res.status(200).json(tipoDnis)
        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarFromPerfil: async (req: Request, res: Response) => {

        try {

            const { idProfesional } = req.params
            const { nombre, apellido, telefono } = req.body
            const profesionalToUpdate = await Profesional.findByPk(idProfesional)
            await profesionalToUpdate.update({ nombre: nombre, apellido: apellido, telefono: telefono })

            res.status(200).json({
                msg: "Profesional actualizado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarFromInstitucion: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idProfesional, idRol } = req.params

            const profesional = await Profesional.findByPk(idProfesional)

            if (profesional['dataValues']['activo'] == false) {
                throw new Error("No existe el profesional solicitado.")
            }

            const profesionalToUpdate = await PersonaJuridicaProfesional.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idProfesional: idProfesional
                }
            })

            if (!profesionalToUpdate) {
                throw new Error("No existe el profesional dentro de la institución.")
            }

            await profesionalToUpdate.update({ fk_idRolInterno: idRol })

            res.status(200).json({
                msg: "Profesional editado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarPassword: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params
            const { actualPassword, newPassword } = req.body


            const usuario = await Usuario.findByPk(idUsuario)

            if (!usuario) {
                throw new Error("No existe el usuario solicitado.")
            }

            const passwordActualUsuario = usuario['dataValues']['password']
            const comparePasswords = bcrypt.compareSync(actualPassword, passwordActualUsuario)

            if (!comparePasswords) {
                throw new Error("Contraseña anterior errónea.")
            }

            if (actualPassword === newPassword) {
                throw new Error("La nueva contraseña no puede coincidir con la contraseña anterior.")
            }

            const salt = bcrypt.genSaltSync(12);
            const newEncriptedPassword = bcrypt.hashSync(newPassword, salt);

            await usuario.update({ password: newEncriptedPassword })

            res.status(200).json({
                msg: "Contraseña del usuario actualizada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    deleteProfesionalById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idProfesional } = req.params
            const profesionalToDelete = await PersonaJuridicaProfesional.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idProfesional: idProfesional,
                    activo: true
                }
            })

            if (!profesionalToDelete) {
                throw new Error("El profesional no pertenece a la institución.")
            }

            await profesionalToDelete.update({ activo: false })
            res.status(200).json({
                msg: "Profesional eliminado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default profesionalesController;