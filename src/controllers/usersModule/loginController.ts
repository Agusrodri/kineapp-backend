import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
require("dotenv").config();
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
import Paciente from '../../models/entities/usersModule/paciente';
import TipoDNI from '../../models/entities/usersModule/tipoDNI';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import sendEmailRefactor from '../../helpers/sendEmailRefactor';

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

            //buscar todos los roles de ese usuario
            //devolver los permisos de cada rol
            //buscar los roles internos que pueda tener en cada persona juridica a la que pertenece
            //devolver los permisos internos dentro de cada persona juridica

            let roles = await findRoles(usuario[0]['dataValues']['id'])
            const rolesInternos = await findRolesInternos(usuario[0]['dataValues']['id'])

            if (roles.length == 0 && !rolesInternos) {
                throw new Error("El usuario no posee ningún rol.")
            }

            //generar el jwt
            const tokenString = email.substring(0, 2)
            const tokenDateNow = new Date()
            const finalToken = tokenString + tokenDateNow.toString()
            const token = await generarToken.generarJWT(finalToken)

            await usuario[0].update({ token: token })

            //si tiene un solo rol dejarlo que inicie sesión con ese rol activo
            if (roles.length + (rolesInternos ? rolesInternos.length : 0) == 1) {
                if (roles.length == 1) {
                    const rolActivoToAsignar = roles[0]['idRol']
                    await usuario[0].update({ rolActivo: rolActivoToAsignar })
                } else if (rolesInternos.length == 1) {
                    const rolInternoActivoToAsignar = rolesInternos[0]['idRolInterno']
                    const personaJuridicaToAsignar = rolesInternos[0]['idInstitucion']
                    await usuario[0].update({ rolInternoActivo: rolInternoActivoToAsignar, personaJuridica: personaJuridicaToAsignar })
                }
            }

            for (let i = 0; i < roles.length; i++) {

                if (roles[i]['idRol'] == 1) {
                    continue
                } else {
                    const paciente = await Paciente.findOne({
                        where: {
                            fk_idUsuario: usuario[0]['dataValues']['id'],
                            activo: true
                        }
                    })

                    if (!paciente) {
                        roles.splice(i, 1)
                    }
                }
            }

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

            await usuarioToDeleteToken.update({ token: null, rolActivo: null, rolInternoActivo: null, personaJuridica: null })

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

            const token = req.header("token")
            const usuarioToFind = await Usuario.findOne({
                where: {
                    token: token,
                    activo: true,
                    habilitado: true
                }
            })

            const { id, rolActivo, rolInternoActivo, personaJuridica } = usuarioToFind['dataValues']

            if (rolActivo) {

                const rolToFind = await Rol.findByPk(rolActivo)

                const rolPermisos = await RolPermiso.findAll({
                    where: {
                        fk_idRol: rolActivo,
                        habilitadoPermiso: true
                    }
                })

                const paciente = await Paciente.findOne({
                    where: {
                        fk_idUsuario: id,
                        activo: true
                    }
                })

                const institucion = await PersonaJuridica.findOne({
                    where: {
                        fk_idUsuarios: id,
                        activo: true
                    }
                })

                const idPaciente = paciente ? paciente['dataValues']['id'] : null
                const idInstitucion = institucion ? institucion['dataValues']['id'] : null

                const permisos = []

                for (let i = 0; i < rolPermisos.length; i++) {

                    const permiso = await Permiso.findByPk(rolPermisos[i]['dataValues']['fk_idPermiso'])

                    const permisoToAdd = {
                        nombrePermiso: permiso['dataValues']['nombrePermiso'],
                        icon: permiso['dataValues']['icon'],
                        nombreMenu: permiso['dataValues']['nombreMenu'],
                        rutaFront: permiso['dataValues']['rutaFront'],
                        requiereIdInst: permiso['dataValues']['requiereIdInst'],
                        requiereIdPac: permiso['dataValues']['requiereIdPac'],
                        isMenu: permiso['dataValues']['isMenu']
                    }

                    permisos.push(permisoToAdd)

                }

                const rol = {
                    idUsuario: usuarioToFind['dataValues']['id'],
                    idPaciente,
                    idInstitucion,
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

                const permisosInternos = []

                for (let k = 0; k < rolInternoPermisoInterno.length; k++) {

                    const permisoInterno = await PermisoInterno.findByPk(rolInternoPermisoInterno[k]['dataValues']['fk_idPermisoInterno'])

                    const permisoInternoToAdd = {
                        nombrePermiso: permisoInterno['dataValues']['nombrePermiso'],
                        icon: permisoInterno['dataValues']['icon'],
                        nombreMenu: permisoInterno['dataValues']['nombreMenu'],
                        rutaFront: permisoInterno['dataValues']['rutaFront'],
                        requiereIdInst: permisoInterno['dataValues']['requiereIdInst'],
                        requiereIdPac: permisoInterno['dataValues']['requiereIdPac'],
                        isMenu: permisoInterno['dataValues']['isMenu']
                    }

                    permisosInternos.push(permisoInternoToAdd)
                }

                const rolInterno = {
                    idUsuario: usuarioToFind['dataValues']['id'],
                    nombreUsuario: profesional['dataValues']['nombre'],
                    idRolInterno: rolInternoActivo,
                    nombreRol: rolInternoToFind['dataValues']['nombreRol'],
                    idInstitucion: personaJuridica,
                    institucion: institucion['dataValues']['nombre'],
                    permisos: permisosInternos

                }

                res.status(200).json(rolInterno)

            } else {
                throw new Error("Complete campos faltantes")
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getInfoPerfil: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const token = req.header("token")
            const { idUsuario } = req.params
            const usuarioToFind = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    token: token,
                    activo: true
                }
            })

            if (!usuarioToFind) {
                throw new Error("No existe correspondencia entre el token enviado y el usuario solicitado.")
            }

            const { rolActivo, rolInternoActivo, personaJuridica } = usuarioToFind['dataValues']

            if (rolActivo) {

                const rolToFind = await Rol.findByPk(rolActivo)
                const rol = {
                    idUsuario: usuarioToFind['dataValues']['id'],
                    idRol: rolToFind['dataValues']['id'],
                    nombreRol: rolToFind['dataValues']['nombreRol'],
                }

                if (rolActivo == 1) {
                    return res.status(200).json({
                        usuarioToFind,
                        rol
                    })
                }

                const paciente = await Paciente.findOne({
                    where: {
                        fk_idUsuario: usuarioToFind['dataValues']['id'],
                        activo: true
                    }
                })

                const institucion = await PersonaJuridica.findOne({
                    where: {
                        fk_idUsuarios: usuarioToFind['dataValues']['id'],
                        activo: true
                    }
                })

                if (paciente) {

                    const obraSocial = await ObraSocial.findOne({
                        where: {
                            id: paciente['dataValues']['fk_idObraSocial'],
                            activo: true
                        }
                    })

                    const planToFind = await Plan.findOne({
                        where: {
                            id: paciente['dataValues']['fk_idPlan'],
                            activo: true
                        }
                    })

                    const tipoDNIToFind = await TipoDNI.findOne({
                        where: {
                            id: paciente['dataValues']['fk_idTipoDNI']
                        }
                    })

                    const tipoDNI = tipoDNIToFind['dataValues']['tipoDNI']

                    res.status(200).json({
                        usuarioToFind,
                        rol,
                        paciente,
                        tipoDNI,
                        nombrePlan: planToFind['dataValues']['nombre'],
                        nombreObraSocial: obraSocial['dataValues']['nombre']
                    })
                } else if (institucion) {
                    res.status(200).json({
                        usuarioToFind,
                        institucion,
                        nombreRol: rolToFind['dataValues']['nombreRol']
                    })
                } else {
                    res.status(404).json({
                        msg: "Paciente or Institución not found"
                    })
                }

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

                const tipoDNIToFind = await TipoDNI.findOne({
                    where: {
                        id: profesional['dataValues']['fk_idTipoDNI']
                    }
                })

                const tipoDNI = tipoDNIToFind['dataValues']['tipoDNI']

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

                const rolInterno = {
                    idUsuario: usuarioToFind['dataValues']['id'],
                    nombreUsuario: profesional['dataValues']['nombre'],
                    idRolInterno: rolInternoActivo,
                    nombreRol: rolInternoToFind['dataValues']['nombreRol'],
                    idInstitucion: personaJuridica,
                    institucion: institucion['dataValues']['nombre'],
                }

                res.status(200).json({
                    usuarioToFind,
                    rolInterno,
                    profesional,
                    tipoDNI
                })

            } else {
                throw new Error("Complete campos faltantes en usuario.")
            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    validateJWT: async (req: Request, res: Response, next: NextFunction) => {

        const { token } = req.params

        try {

            jwt.verify(token, process.env.SECRETORPRIVATEKEY)

            res.status(200).json({
                response: true
            })

        } catch (error) {

            try {
                const userToLogOut = await Usuario.findOne({
                    where: {
                        token: token
                    }
                })

                if (!userToLogOut) {
                    throw new Error("No existe un usuario asociado al token indicado.")
                }

                await userToLogOut.update({ token: null })

                res.status(200).json({
                    response: false
                })

            } catch (error) {
                res.status(500).json({
                    msg: `${error}`
                });
            }
        }
    },

    sendEmailToRestorePassword: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { nuevoLink, email, subject, htmlText } = req.body

            const usuario = await Usuario.findOne({
                where: {
                    email: email,
                    activo: true
                }
            })

            if (!usuario) {
                throw new Error("El email ingresado no existe en el sistema.")
            }

            const tokenString = email.substring(0, 2)
            const tokenDateNow = new Date()
            const finalToken = tokenString + tokenDateNow.toString()
            const resetPasstoken = await generarToken.generarJWT(finalToken)

            await usuario.update({ tokenPassReset: resetPasstoken })

            const idUsuario = usuario['dataValues']['id']
            const linkWithId = `${nuevoLink}/${idUsuario}`

            await sendEmailRefactor(linkWithId, email, subject, htmlText)

            res.status(200).json({
                msg: "Email para restablecer contraseña enviado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    restorePassword: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { idUsuario } = req.params
            const { newPassword } = req.body

            const usuario = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true
                }
            })

            if (!usuario) {
                throw new Error("No existe el usuario solicitado.")
            }

            if (usuario['dataValues']['tokenPassReset']) {

                try {

                    jwt.verify(usuario['dataValues']['tokenPassReset'], process.env.SECRETORPRIVATEKEY)

                } catch (error) {
                    return res.status(401).json({
                        msg: "Token no válido - Usuario no autorizado para modificar la contraseña."
                    })
                }

            } else {
                return res.status(401).json({
                    msg: "Usuario no autorizado para modificar la contraseña."
                })
            }

            const passwordActualUsuario = usuario['dataValues']['password']
            const comparePasswords = bcrypt.compareSync(newPassword, passwordActualUsuario)

            if (comparePasswords) {
                throw new Error("La contraseña es igual a la anterior.")
            }

            const salt = bcrypt.genSaltSync(12);
            const newEncriptedPassword = bcrypt.hashSync(newPassword, salt);

            await usuario.update({ password: newEncriptedPassword })

            res.status(200).json({
                msg: `Contraseña del usuario ${usuario['dataValues']['email']} actualizada correctamente.`
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default loginControllers