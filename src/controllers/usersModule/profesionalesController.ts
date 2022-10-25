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
import { Op } from 'sequelize';

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

                const rolInterno = await RolInterno.findOne({
                    where: {
                        id: pjProfesionales[i]['dataValues']['fk_idRolInterno'],
                        activo: true
                    }
                })

                const nombreRolInterno = rolInterno ? rolInterno['dataValues']['nombreRol'] : "Sin rol asignado"

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
                    rol: nombreRolInterno
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
            const rolInternoProfesional = await RolInterno.findOne({
                where: {
                    id: idRolInterno,
                    activo: true
                }
            })
            const nombreRolInterno = rolInternoProfesional ? rolInternoProfesional['dataValues']['nombreRol'] : "Sin rol asignado"

            //buscar usuario para obtener email
            const idUsuario = profesional['dataValues']['fk_idUsuario']
            const usuarioProfesional = await Usuario.findByPk(idUsuario)
            const emailProfesional = usuarioProfesional['dataValues']['email']
            const telefonoProfesional = usuarioProfesional['dataValues']['telefono']

            const tipoDNI = await TipoDNI.findByPk(profesional['dataValues']['fk_idTipoDNI'])

            //response final
            const profesionalResponse = {
                idUsuario: idUsuario,
                nombre: profesional['dataValues']['nombre'],
                apellido: profesional['dataValues']['apellido'],
                dni: profesional['dataValues']['dni'],
                tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                idTipoDNI: profesional['dataValues']['fk_idTipoDNI'],
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
            })

            //asociar profesional con la institución y setear el rol interno que posee el profesional
            await PersonaJuridicaProfesional.create({
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idProfesional: nuevoProfesional['dataValues']['id'],
                fk_idRolInterno: idRol,
                activo: true
            })

            const rolInternoProfesional = await RolInterno.findOne({
                where: {
                    id: idRol,
                    activo: true
                }
            })

            const nuevoProfesionalResponse = {
                id: nuevoProfesional['dataValues']['id'],
                nombre: nuevoProfesional['dataValues']['nombre'],
                apellido: nuevoProfesional['dataValues']['apellido'],
                dni: nuevoProfesional['dataValues']['dni'],
                fk_idTipoDNI: nuevoProfesional['dataValues']['fk_idTipoDNI'],
                fechaNacimiento: nuevoProfesional['dataValues']['fechaNacimiento'],
                numeroMatricula: nuevoProfesional['dataValues']['numeroMatricula'],
                nivelEducativo: nuevoProfesional['dataValues']['nivelEducativo'],
                fk_idUsuario: nuevoUsuarioProfesional['dataValues']['id'],
                rol: rolInternoProfesional['dataValues']['nombreRol']
            }

            const idUsuario = nuevoUsuarioProfesional['dataValues']['id']
            const idProfesional = nuevoProfesional['dataValues']['id']

            const nuevoLink = `${link}/${idUsuario}/${idProfesional}`

            //enviar email
            await sendEmail(nuevoLink, email)

            res.status(200).json({
                msg: "Profesional creado correctamente.",
                usuarioExistente: false,
                idPersonaJuridica,
                nuevoUsuarioProfesional,
                nuevoProfesional: nuevoProfesionalResponse
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

            await usuarioToUpdate.update({ password: encriptedPassword, habilitado: true })

            res.status(200).json({
                msg: `Cuenta verificada correctamente`
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
                    activo: true,
                    habilitado: true
                }
            })

            if (!usuarioToFind) {
                throw new Error("El correo ingresado no coincide con ningún usuario del sistema")
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
                    throw new Error("El correo ingresado ya corresponde a un profesional de la institución")
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
                        nivelEducativo,
                        bandera: false
                    })
                }
            } else {
                //verificar si el email pertenece a un paciente
                const pacienteToFind = await Paciente.findOne({
                    where: {
                        fk_idUsuario: idUsuarioEncontrado,
                        activo: true
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
                    fechaNacimiento,
                    bandera: true
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
            const { idRol, bandera, nombre, apellido, dni, idTipoDNI, fechaNacimiento, numeroMatricula, nivelEducativo } = req.body

            //propiedades a pedir si el usuario encontrado es paciente
            //nombre, apellido, dni, fk_idTipoDNI, fechaNacimiento, numeroMatricula, nivelEducativo
            const usuarioActivo = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true
                }
            })

            if (!usuarioActivo) {
                throw new Error("No existe el usuario solicitado.")
            }

            //buscar profesional asociado al usuario
            const usuarioProfesional = await Profesional.findOne({
                where: {
                    fk_idUsuario: idUsuario
                }
            })

            //si la bandera es true indica que tenemos que crear un profesional nuevo
            if (bandera === false) {

                if (!usuarioProfesional) {
                    throw new Error("No existe un profesional asociado al usuario indicado.")
                }

                //asociar profesional con la institución y setear el rol interno que posee el profesional
                const newPjProfesional = await PersonaJuridicaProfesional.create({
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idProfesional: usuarioProfesional['dataValues']['id'],
                    fk_idRolInterno: idRol,
                    activo: true
                })

                res.status(200).json({
                    msg: "Profesional creado correctamente",
                    usuarioProfesional,
                    newPjProfesional
                })


            } else {

                if (usuarioProfesional) {
                    throw new Error("Ya existe un profesional asociado al usuario indicado.")
                }

                if (numeroMatricula) {
                    const profesionalMatricula = await Profesional.findOne({
                        where: {
                            numeroMatricula: numeroMatricula
                        }
                    })

                    if (profesionalMatricula) {
                        throw new Error("El número de matrícula que intenta ingresar ya pertenece a un usuario en el sistema")
                    }
                }

                const newProfesional = await Profesional.create({
                    nombre: nombre,
                    apellido: apellido,
                    dni: dni,
                    fk_idTipoDNI: idTipoDNI,
                    fechaNacimiento: fechaNacimiento,
                    numeroMatricula: numeroMatricula,
                    nivelEducativo: nivelEducativo,
                    fk_idUsuario: usuarioActivo['dataValues']['id'],
                })

                const newPjProfesional = await PersonaJuridicaProfesional.create({
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idProfesional: newProfesional['dataValues']['id'],
                    fk_idRolInterno: idRol,
                    activo: true
                })

                res.status(200).json({
                    msg: "Profesional creado correctamente",
                    newProfesional,
                    newPjProfesional
                })

            }

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
                msg: "Profesional actualizado correctamente"
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarFromInstitucion: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { idProfesional, idRol } = req.body
            const profesional = await Profesional.findByPk(idProfesional)

            if (profesional['dataValues']['activo'] == false) {
                throw new Error("No existe el profesional solicitado.")
            }

            const profesionalToUpdate = await PersonaJuridicaProfesional.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idProfesional: idProfesional,
                    activo: true
                }
            })

            if (!profesionalToUpdate) {
                throw new Error("No existe el profesional dentro de la institución.")
            }

            await profesionalToUpdate.update({ fk_idRolInterno: idRol })

            const usuario = await Usuario.findOne({
                where: {
                    id: profesional['dataValues']['fk_idUsuario'],
                    activo: true
                }
            })

            const rolInterno = await RolInterno.findOne({
                where: {
                    id: profesionalToUpdate['dataValues']['fk_idRolInterno']
                }
            })

            const tipoDNI = await TipoDNI.findByPk(profesional['dataValues']['fk_idTipoDNI'])

            const response = {
                id: profesional['dataValues']['id'],
                nombre: profesional['dataValues']['nombre'],
                apellido: profesional['dataValues']['apellido'],
                dni: profesional['dataValues']['dni'],
                idTipoDNI: profesional['dataValues']['fk_idTipoDNI'],
                fechaNacimiento: profesional['dataValues']['fechaNacimiento'],
                numeroMatricula: profesional['dataValues']['numeroMatricula'],
                nivelEducativo: profesional['dataValues']['nivelEducativo'],
                idUsuario: profesional['dataValues']['fk_idUsuario'],
                email: usuario['dataValues']['email'],
                telefono: usuario['dataValues']['telefono'],
                tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                rol: rolInterno['dataValues']['nombreRol'],

            }

            res.status(200).json({
                msg: "Profesional actualizado correctamente",
                profesional: response,
                newPjProfesional: profesionalToUpdate
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
                throw new Error("Contraseña actual incorrecta, intente nuevamente")
            }

            if (actualPassword === newPassword) {
                throw new Error("La nueva contraseña debe ser diferente a la actual")
            }

            const salt = bcrypt.genSaltSync(12);
            const newEncriptedPassword = bcrypt.hashSync(newPassword, salt);

            await usuario.update({ password: newEncriptedPassword })

            res.status(200).json({
                msg: "Contraseña actualizada correctamente"
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
                msg: "Profesional eliminado correctamente"
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default profesionalesController;