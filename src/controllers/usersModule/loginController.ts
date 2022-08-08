import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../../models/entities/usersModule/usuario';
import generarToken from '../../helpers/generateJWT';
import findRoles from '../../helpers/findRoles';
import findRolesInternos from '../../helpers/findRolesInternos';
import RolPermiso from 'models/entities/usersModule/rolPermiso';

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

            //buscar todos los roles de ese usuario
            //devolver los permisos de cada rol
            //buscar los roles internos que pueda tener en cada persona juridica a la que pertenece
            //devolver los permisos internos dentro de cada persona juridica

            const roles = await findRoles(usuario[0]['dataValues']['id'])
            const rolesInternos = await findRolesInternos(usuario[0]['dataValues']['id'])

            res.status(200).json({
                msg: `Sesión del usuario ${email} iniciada`,
                token,
                roles,
                rolesInternos
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
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
    },

    setActivo: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { token, rolActivo, rolInternoActivo, personaJuridica } = req.body

            const usuarioActivo = await Usuario.findOne({
                where: {
                    token: token
                }
            })

            if (!usuarioActivo) {
                throw new Error("No existe un usuario con token activo que coincida con el token indicado.")
            }

            await usuarioActivo.update({
                rolActivo: rolActivo,
                rolInternoActivo: rolInternoActivo,
                personaJuridica: personaJuridica
            })

            const response = []

            if (rolActivo) {

                const rolPermisos = await RolPermiso.findAll({
                    where: {
                        fk_idRol: rolActivo,
                        habilitadoPermiso: true
                    }
                })

                for (let i = 0; i < rolPermisos.length; i++) {

                }


            }

            res.status(200).json(usuarioActivo)

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al cerrar sesión'
            });
        }
    }
}

export default loginControllers