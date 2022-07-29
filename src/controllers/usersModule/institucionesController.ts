import { NextFunction, Request, Response } from "express"
import bcrypt from 'bcrypt';
import nodeMailer from 'nodemailer'
import Usuario from "../../models/entities/usuario";
import PersonaJuridica from "../../models/entities/personaJuridica";
import UsuarioRol from "../../models/entities/usuarioRol";
import Rol from "../../models/entities/rol";

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
                throw new Error("No existen instituciones cargadas")

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

            //obtener los datos de la institucion que necesitamos enviar al front

            const { nombre, razonSocial, domicilio, fk_idUsuarios, cuit, habMinisterioSalud, habMunicipal, habSuperintendencia } = institucion['dataValues']

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

            //crear usuario
            const nuevoUsuario = await Usuario.create({ password: null, email: email, telefono: telefono })

            const idNuevoUsuario = nuevoUsuario['dataValues']['id']

            await UsuarioRol.create({ fk_idUsuario: idNuevoUsuario, fk_idRol: idRol })

            //crear persona jurídica
            await PersonaJuridica.create({
                nombre: nombre,
                razonSocial: razonSocial,
                domicilio: domicilio,
                cuit: cuit,
                fk_idUsuarios: idNuevoUsuario,
                habilitado: false,
                activo: true
            })

            const nuevoLink = `${link}/${idNuevoUsuario}`

            //enviar email
            const transporter = nodeMailer.createTransport({
                host: 'smtp.elasticemail.com',
                port: 2525,
                auth: {
                    user: '4devteam.utn@gmail.com',
                    pass: 'D100A4CC8DD477EC6F17BF177463F4BBF514'
                }
            });

            const mailOptions = {
                from: '4devteam.utn@gmail.com',
                to: email,
                subject: "Verificación cuenta kineapp",
                html: `<a href=${nuevoLink}>Click aquí para verificar tu cuenta</a>` // html body
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.status(200).json({ msg: "Email enviado" })
            });

            res.status(200).json({
                msg: `Institución con nombre ${nombre} creada correctamente. Se envió un email a la dirección ${email} para verificación.`
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



}

export default institucionesController;