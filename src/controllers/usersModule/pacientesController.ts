import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../../models/entities/usersModule/usuario';
import sendEmail from '../../helpers/send-email';
import Paciente from '../../models/entities/usersModule/paciente';
import UsuarioRol from '../../models/entities/usersModule/usuarioRol';
import Profesional from '../../models/entities/usersModule/profesional';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';
import TipoDNI from '../../models/entities/usersModule/tipoDNI';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import { Op } from 'sequelize';

const pacientesController = {

    createUsuario: async (req: Request, res: Response) => {

        try {

            const { email, password, link } = req.body

            const usuarioToFind = await Usuario.findOne({
                where: {
                    email: email,
                    activo: true
                }
            })

            if (usuarioToFind) {
                throw new Error("El correo electrónico ya está en uso.")
            }

            const salt = bcrypt.genSaltSync(12);
            const newEncriptedPassword = bcrypt.hashSync(password, salt);

            const nuevoUsuario = await Usuario.create({
                email: email,
                password: newEncriptedPassword,
                activo: true,
                habilitado: false
            })

            const idNuevoUsuario = nuevoUsuario['dataValues']['id']

            const nuevoLink = `${link}/${idNuevoUsuario}`

            await sendEmail(nuevoLink, email)

            res.status(200).json({
                msg: `Usuario creado correctamente. Se envió un correo electrónico a la dirección ${email} para verificación.`
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    createPaciente: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params

            const usuarioHabilitar = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true
                }
            })

            if (!usuarioHabilitar) {
                throw new Error("No existe el usuario indicado.")
            }

            const { nombre,
                apellido,
                dni,
                idTipoDNI,
                fechaNacimiento,
                telefono,
                idObraSocial,
                idPlan,
                numeroAfiliado } = req.body

            const pacienteToFind = await Paciente.findOne({
                where: {
                    [Op.or]: {
                        dni: dni,
                        [Op.and]: {
                            numeroAfiliado: numeroAfiliado,
                            fk_idObraSocial: idObraSocial
                        }
                    },
                    activo: true
                }
            })

            if ((pacienteToFind ? pacienteToFind['dataValues']['dni'] : 0) == dni) {
                throw new Error("El DNI ingresado ya se encuentra en uso. Por favor, ingrese uno diferente.")
            } else if ((pacienteToFind ? pacienteToFind['dataValues']['numeroAfiliado'] : 0) &&
                (pacienteToFind ? pacienteToFind['dataValues']['fk_idObraSocial'] : 0) == idObraSocial) {
                throw new Error("El número de afiliado ya existe dentro de la obra social indicada. Por favor, ingrese uno diferente.")
            }

            await Paciente.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                fk_idTipoDNI: idTipoDNI,
                fechaNacimiento: fechaNacimiento,
                fk_idUsuario: idUsuario,
                fk_idObraSocial: idObraSocial,
                fk_idPlan: idPlan,
                numeroAfiliado: numeroAfiliado,
                activo: true
            })

            await usuarioHabilitar.update({ habilitado: true, telefono: telefono })

            await UsuarioRol.create({
                fk_idUsuario: idUsuario,
                fk_idRol: 74 //id del rol Persona Fisica Paciente
            })

            res.status(200).json({
                msg: "Paciente creado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarPaciente: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params
            const { nombre, apellido, fechaNacimiento, telefono, idObraSocial, idPlan } = req.body

            const usuarioToUpdate = await Usuario.findByPk(idUsuario)

            if (!usuarioToUpdate) {
                throw new Error("No existe el usuario indicado.")
            }

            const pacienteToUpdate = await Paciente.findOne({
                where: {
                    fk_idUsuario: idUsuario
                }
            })

            if (!pacienteToUpdate) {
                throw new Error("No existe un paciente asociado al usuario indicado.")
            }

            await pacienteToUpdate.update({
                nombre: nombre,
                apellido: apellido,
                fechaNacimiento: fechaNacimiento,
                fk_idObrasocial: idObraSocial,
                fk_idPlan: idPlan
            })

            await usuarioToUpdate.update({ telefono: telefono })

            res.status(200).json({
                msg: "Paciente actualizado correctamente"
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarPaciente: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params
            const { password } = req.body

            const usuario = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true
                }
            })

            if (!usuario) {
                throw new Error("No existe el usuario solicitado.")
            }

            const passwordToVerify = usuario['dataValues']['password']
            const validPassword = bcrypt.compareSync(password, passwordToVerify)

            if (!validPassword) {
                return res.status(400).json({
                    msg: "Contraseña incorrecta"
                })
            }

            const profesional = await Profesional.findOne({
                where: {
                    fk_idUsuario: idUsuario
                }
            })

            if (!profesional) {
                await usuario.update({ activo: false, habilitado: false })
            }

            const pacienteToDelete = await Paciente.findOne({
                where: {
                    fk_idUsuario: idUsuario,
                    activo: true
                }
            })

            if (!pacienteToDelete) {
                throw new Error("No existe un paciente asociado al usuario indicado.")
            }

            await pacienteToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Paciente eliminado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    createPacienteConUsuario: async (req: Request, res: Response) => {

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
                throw new Error("El email ingresado no coincide con ningún usuario del sistema.")
            }

            const idUsuarioEncontrado = usuarioToFind['dataValues']['id']

            //verificar si el email pertenece a un paciente
            const pacienteToFind = await Paciente.findOne({
                where: {
                    fk_idUsuario: idUsuarioEncontrado,
                    activo: true
                }
            })

            if (!pacienteToFind) {
                throw new Error("El email ingresado no coincide con ningún paciente del sistema.")
            }

            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: pacienteToFind['dataValues']['id'],
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (pjPaciente) {
                throw new Error("El usuario ya es paciente de esta institución.")
            }

            const { nombre, apellido, dni, fk_idTipoDNI, fechaNacimiento, fk_idObraSocial, fk_idPlan, numeroAfiliado } = pacienteToFind['dataValues']

            //obtener datos restantes - tipoDNI, obraSocial y plan
            const tipoDNI = await TipoDNI.findByPk(pacienteToFind['dataValues']['fk_idTipoDNI'])
            const obraSocial = pacienteToFind['dataValues']['fk_idObraSocial'] ? await ObraSocial.findByPk(pacienteToFind['dataValues']['fk_idObraSocial']) : null
            const plan = pacienteToFind['dataValues']['fk_idPlan'] ? await Plan.findByPk(pacienteToFind['dataValues']['fk_idPlan']) : null

            res.status(200).json({
                msg: "Información del usuario encontrado.",
                idUsuario: idUsuarioEncontrado,
                idPaciente: pacienteToFind['dataValues']['id'],
                nombre,
                apellido,
                dni,
                idTipoDNI: fk_idTipoDNI,
                tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                fechaNacimiento,
                telefono: usuarioToFind['dataValues']['telefono'],
                email: usuarioToFind['dataValues']['email'],
                idObraSocial: fk_idObraSocial,
                obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                idPlan: fk_idPlan,
                plan: plan ? plan['dataValues']['nombre'] : null,
                numeroAfiliado
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    createPacienteFromUsuario: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idPaciente, idUsuario } = req.params
            const { nombre,
                apellido,
                dni,
                tipoDNI,
                fechaNacimiento,
                obraSocial,
                plan,
                numeroAfiliado } = req.body

            const usuario = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true,
                    habilitado: true
                }
            })

            if (!usuario) {
                throw new Error("No existe el usuario solicitado.")
            }

            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (pjPaciente) {
                throw new Error("El usuario ya es paciente de esta institución.")
            }

            await PersonaJuridicaPaciente.create({
                fk_idPaciente: idPaciente,
                fk_idPersonaJuridica: idPersonaJuridica,
                activo: true
            })

            const pacienteResponse = {
                msg: "Paciente creado con éxito.",
                id: idPaciente,
                idUsuario: idUsuario,
                nombre,
                apellido,
                dni,
                tipoDNI,
                fechaNacimiento,
                obraSocial,
                plan,
                numeroAfiliado,
                email: usuario['dataValues']['email'],
                telefono: usuario['dataValues']['telefono']
            }

            res.status(200).json(pacienteResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default pacientesController;