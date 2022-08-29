import { NextFunction, Request, Response } from "express"
import bcrypt from 'bcrypt';
import nodeMailer from 'nodemailer'
import Usuario from "../../models/entities/usersModule/usuario";
import PersonaJuridica from "../../models/entities/usersModule/personaJuridica";
import UsuarioRol from "../../models/entities/usersModule/usuarioRol";
import Rol from "../../models/entities/usersModule/rol";
import sendEmail from "../../helpers/send-email";

const institucionesController = {

    getInstituciones: async (req: Request, res: Response) => {

        try {

            const instituciones = await PersonaJuridica.findAll({
                where: {
                    activo: true
                }
            })

            if (instituciones.length != 0) {

                res.status(200).json(instituciones)

            } else {
                throw new Error("No existen instituciones cargadas.")

            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getInstitucionById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            //buscar la institucion con el id
            const institucion = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            if (!institucion) {
                throw new Error("No se encontró la institución.")
            }

            //obtener los datos de la institucion que necesitamos enviar al front
            const { id, nombre, razonSocial, domicilio, fk_idUsuarios, cuit, habMinisterioSalud, habMunicipal, habSuperintendencia } = institucion['dataValues']

            //buscar al usuario asociado a esa persona jurídica
            const usuarioInstitucion = await Usuario.findByPk(fk_idUsuarios)

            //obtener los datos del usuario que necesitamos enviar al front
            const { email, telefono } = usuarioInstitucion['dataValues']

            //obtener el rol de ese usuario asociado a la persona juridica
            const usuarioRol = await UsuarioRol.findOne({
                where: {
                    fk_idUsuario: fk_idUsuarios
                }
            })

            const idRolUsuario = usuarioRol['dataValues']['fk_idRol']

            const rol = await Rol.findByPk(idRolUsuario)

            //obtener los datos del rol a enviar al front
            const nombreRol = rol['dataValues']['nombreRol']

            //response final
            const responseJson = {
                id,
                idUsuario: fk_idUsuarios,
                nombre: nombre,
                cuit: cuit,
                razonSocial: razonSocial,
                email: email,
                domicilio: domicilio,
                telefono: telefono,
                nombreRol: nombreRol,
                habMinisterioSalud: habMinisterioSalud,
                habMunicipal: habMunicipal,
                habSuperintendencia: habSuperintendencia
            }

            res.status(200).json(responseJson)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    createInstitucion: async (req: Request, res: Response) => {

        try {

            const { nombre, cuit, razonSocial, email, domicilio, telefono, idRol, link } = req.body

            const usuarioToFind = await Usuario.findOne({
                where: {
                    email: email,
                    activo: true
                }
            })

            if (usuarioToFind) {
                throw new Error("El email ingresado se encuentra en uso. Por favor, ingrese uno nuevo.")
            }

            //crear usuario
            const nuevoUsuario = await Usuario.create({
                password: null,
                email: email,
                telefono: telefono,
                rolActivo: idRol,
                rolInternoActivo: null,
                personaJuridica: null
            })
            const idNuevoUsuario = nuevoUsuario['dataValues']['id']

            await UsuarioRol.create({ fk_idUsuario: idNuevoUsuario, fk_idRol: idRol })

            //crear persona jurídica
            const nuevaInstitucion = await PersonaJuridica.create({
                nombre: nombre,
                razonSocial: razonSocial,
                domicilio: domicilio,
                cuit: cuit,
                fk_idUsuarios: idNuevoUsuario,
                habilitado: false,
                activo: true
            })

            const idNuevaInstitucion = nuevaInstitucion['dataValues']['id']
            const nuevoLink = `${link}/${idNuevoUsuario}/${idNuevaInstitucion}`

            //enviar email
            await sendEmail(nuevoLink, email)

            res.status(200).json({
                msg: `Institución con nombre ${nombre} creada correctamente. Se envió un correo electrónico a la dirección ${email} para verificación.`,
                nuevaInstitucion
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    validarInstitucion: async (req: Request, res: Response) => {

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

    updateInstitucionById: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params
            const { id } = req.body
            const usuarioRolToUpdate = await UsuarioRol.findOne({
                where: {
                    fk_idUsuario: idUsuario
                }
            })

            await usuarioRolToUpdate.update({ fk_idRol: id })

            const institucion = await PersonaJuridica.findOne({
                where: {
                    fk_idUsuarios: idUsuario
                }
            })

            res.status(200).json({
                msg: `Institución actualizada con éxito.`,
                institucion,
                usuariosRol: usuarioRolToUpdate
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    deleteInstitucionById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const institucionToDelete = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            if (!institucionToDelete) {
                throw new Error("No se encontró a la institución.")
            }

            await institucionToDelete.update({ activo: false })

            res.status(200).json({
                msg: `La institución se eliminó correctamente.`
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    habilitarInstitucion: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            const personaJuridicaToHabilitar = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            if (!personaJuridicaToHabilitar) {
                throw new Error("No se encontró la institución solicitada.")
            }

            personaJuridicaToHabilitar.update({ habilitado: true })

            res.status(200).json({
                msg: "Institución habilitada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarInstitucionFromPerfil: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { nombre, razonSocial, domicilio, telefono } = req.body

            const personaJuridicaToEdit = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            if (!personaJuridicaToEdit) {
                throw new Error("No existe la institución indicada.")
            }

            await personaJuridicaToEdit.update({ nombre: nombre, razonSocial: razonSocial, domicilio: domicilio })

            const usuario = await Usuario.findOne({
                where: {
                    id: personaJuridicaToEdit['dataValues']['fk_idUsuarios']
                }
            })

            await usuario.update({ telefono: telefono })

            res.status(200).json({
                msg: "Institución actualizada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default institucionesController;