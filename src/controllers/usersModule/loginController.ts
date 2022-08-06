import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../../models/entities/usersModule/usuario';
import generarToken from '../../helpers/generateJWT';

const loginControllers = {

    login: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { email, password } = req.body

            // Verificar si el usuario existe
            const usuario = await Usuario.findAll({
                where: {
                    email: email,
                    activo: true,
                    habilitado: true
                }
            })

            if (usuario.length > 1) {
                throw new Error("Se encontraron dos usuarios con el mismo email. Por favor revise la base de datos.")
            }

            console.log(usuario)

            //verificar contraseña
            const passwordToVerify = usuario[0]['dataValues']['password']
            const validPassword = bcrypt.compareSync(password, passwordToVerify)

            if (!validPassword) {
                return res.status(400).json({
                    msg: "Contraseña inválida."
                })
            }

            //generar el jwt
            const tokenString = email.substring(0, 2)
            const tokenDateNow = new Date()
            const finalToken = tokenString + tokenDateNow.toString()
            const token = await generarToken.generarJWT(finalToken)

            await usuario[0].update({ token: token })

            res.status(200).json({
                msg: `Sesión del usuario ${email} iniciada`,
                token
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al iniciar sesión'
            });
        }
    },

    logout: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const token = req.header('token')
            const usuarioToDeleteToken = await Usuario.findOne({
                where: {
                    token: token
                }
            })

            await usuarioToDeleteToken.update({ token: null })

            res.status(200).json({
                msg: `Token del usuario ${usuarioToDeleteToken['dataValues']['email']} desvinculado.`
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al cerrar sesión'
            });
        }
    }
}

export default loginControllers