import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../../models/entities/usersModule/usuario';
import sendEmail from '../../helpers/send-email';

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
                activo: false
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

    }

}

export default pacientesController;