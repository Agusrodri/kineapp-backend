import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../../models/entities/usersModule/usuario';
import generarToken from '../../helpers/generateJWT';
import findRoles from '../../helpers/findRoles';
import findRolesInternos from '../../helpers/findRolesInternos';
import RolPermiso from '../../models/entities/usersModule/rolPermiso';
import Permiso from '../../models/entities/usersModule/permiso';
import Rol from '../../models/entities/usersModule/rol';
import Profesional from '../../models/entities/usersModule/profesional';
import PersonaJuridicaProfesional from '../../models/entities/usersModule/personaJuridicaProfesional';
import RolInterno from '../../models/entities/usersModule/rolInterno';
import RolInternoPermisoInterno from '../../models/entities/usersModule/rolInternoPermisoInterno';
import PermisoInterno from '../../models/entities/usersModule/permisoInterno';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';

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

            if (usuario.length == 0) {
                throw new Error("No se encontró un usuario con el email indicado.")
            }

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
                idUsuario: usuario[0]['dataValues']['id'],
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

            const { idUsuario, idRol, idRolInterno, idInstitucion } = req.body

            const usuarioActivo = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true,
                    habilitado: true
                }
            })

            if (!usuarioActivo) {
                throw new Error("No existe el usuario indicado.")
            }

            await usuarioActivo.update({
                rolActivo: null,
                rolInternoActivo: null,
                personaJuridica: null
            })

            await usuarioActivo.update({
                rolActivo: idRol,
                rolInternoActivo: idRolInterno,
                personaJuridica: idInstitucion
            })

            res.status(200).json(usuarioActivo)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getInfoUsuarios: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { token } = req.params
            const usuarioToFind = await Usuario.findOne({
                where: {
                    token: token,
                    activo: true,
                    habilitado: true
                }
            })

            const { rolActivo, rolInternoActivo, personaJuridica } = usuarioToFind['dataValues']

            if (rolActivo) {

                const rolToFind = await Rol.findByPk(rolActivo)

                const rolPermisos = await RolPermiso.findAll({
                    where: {
                        fk_idRol: rolActivo,
                        habilitadoPermiso: true
                    }
                })

                const permisos = []

                for (let i = 0; i < rolPermisos.length; i++) {

                    const permiso = await Permiso.findByPk(rolPermisos[i]['dataValues']['fk_idPermiso'])

                    const permisoToAdd = {
                        nombrePermiso: permiso['dataValues']['nombrePermiso'],
                        icon: permiso['dataValues']['icon'],
                        nombreMenu: permiso['dataValues']['nombreMenu'],
                        rutaFront: permiso['dataValues']['rutaFront'],
                        requiereId: permiso['dataValues']['requiereId']
                    }

                    permisos.push(permisoToAdd)

                }

                const rol = {
                    idUsuario: usuarioToFind['dataValues']['id'],
                    idRol: rolToFind['dataValues']['id'],
                    nombreRol: rolToFind['dataValues']['nombreRol'],
                    permisos: permisos
                }

                res.status(200).json(rol)

            } else if (rolInternoActivo && personaJuridica) {

                const institucion = await PersonaJuridica.findOne({
                    where: {
                        id: personaJuridica,
                        activo: true
                    }
                })

                const profesional = await Profesional.findOne({
                    where: {
                        fk_idUsuario: usuarioToFind['dataValues']['id']
                    }
                })

                const pjProfesional = await PersonaJuridicaProfesional.findOne({
                    where: {
                        fk_idPersonaJuridica: personaJuridica,
                        fk_idRolInterno: rolInternoActivo,
                        fk_idProfesional: profesional['dataValues']['id']
                    }
                })

                if (!pjProfesional) {
                    throw new Error("El profesional no pertenece a la institucion indicada.")
                }

                const rolInternoToFind = await RolInterno.findByPk(rolInternoActivo)

                const rolInternoPermisoInterno = await RolInternoPermisoInterno.findAll({
                    where: {
                        fk_idRolInterno: rolInternoActivo,
                        habilitadoPermiso: true
                    }
                })

                const permisos = []

                for (let k = 0; k < rolInternoPermisoInterno.length; k++) {

                    const permisoInterno = await PermisoInterno.findByPk(rolInternoPermisoInterno[k]['dataValues']['fk_idPermisoInterno'])

                    const permisoInternoToAdd = {
                        nombrePermiso: permisoInterno['dataValues']['nombrePermiso'],
                        icon: permisoInterno['dataValues']['icon'],
                        nombreMenu: permisoInterno['dataValues']['nombreMenu'],
                        rutaFront: permisoInterno['dataValues']['rutaFront'],
                        requiereId: permisoInterno['dataValues']['requiereId']
                    }

                    permisos.push(permisoInternoToAdd)
                }

                const rolInterno = {
                    idUsuario: usuarioToFind['dataValues']['id'],
                    nombreUsuario: profesional['dataValues']['nombre'],
                    idRolInterno: rolInternoActivo,
                    nombreRol: rolInternoToFind['dataValues']['nombrePermiso'],
                    idInstitucion: personaJuridica,
                    institucion: institucion['dataValues']['nombre'],
                    permisos: permisos

                }

                res.status(200).json(rolInterno)

            } else {
                throw new Error("Complete campos faltantes")
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al cerrar sesión'
            });
        }
    }
}

export default loginControllers