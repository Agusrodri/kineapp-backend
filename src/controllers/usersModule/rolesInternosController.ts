import { NextFunction, Request, Response } from "express"
import { Op, Sequelize, where } from "sequelize"
import RolInterno from "../../models/entities/usersModule/rolInterno"
import RolInternoPermisoInterno from "../../models/entities/usersModule/rolInternoPermisoInterno"
import PersonaJuridica from "../../models/entities/usersModule/personaJuridica"
import PermisoInterno from "../../models/entities/usersModule/permisoInterno"


const rolesInternosController = {

    getRolesInternos: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            const rolesinternos = await RolInterno.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (rolesinternos.length == 0) {
                throw new Error("No existen roles internos cargados para esta institución.")
            }

            const rolResponseJson = []

            for (let i = 0; i < rolesinternos.length; i++) {

                const rolPermiso = await RolInternoPermisoInterno.findAll({
                    where: {
                        fk_idRolInterno: rolesinternos[i]['dataValues']['id']
                    }
                })

                const permisosJson = []

                for (let j = 0; j < rolPermiso.length; j++) {

                    const permisoInterno = await PermisoInterno.findOne({
                        where: {
                            id: rolPermiso[j]['dataValues']['fk_idPermisoInterno']
                        }
                    })

                    let permiso = {
                        idPermiso: permisoInterno['dataValues']['id'],
                        nombrePermiso: permisoInterno['dataValues']['nombrePermiso'],
                        habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']
                    }

                    permisosJson.push(permiso)
                }

                const rolResponse = {
                    id: rolesinternos[i]['dataValues']['id'],
                    nombreRol: rolesinternos[i]['dataValues']['nombreRol'],
                    descripcionRol: rolesinternos[i]['dataValues']['descripcionRol'],
                    activo: rolesinternos[i]['dataValues']['activo'],
                    fk_idPersonaJuridica: rolesinternos[i]['dataValues']['fk_idPersonaJuridica'],
                    permisos: permisosJson
                }

                rolResponseJson.push(rolResponse)

            }

            res.status(200).json(rolResponseJson)


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    createRolInterno: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { nombreRol, descripcionRol, permisos } = req.body

            const rolInterno = await RolInterno.create({
                nombreRol: nombreRol,
                descripcionRol: descripcionRol,
                fk_idPersonaJuridica: idPersonaJuridica,
                activo: true
            })

            const idNuevoRol = rolInterno['dataValues']['id']

            const permisosJson = []

            for (let i = 0; i < permisos.length; i++) {

                const rolPermiso = await RolInternoPermisoInterno.create({
                    fk_idPermisoInterno: permisos[i]['idPermiso'],
                    fk_idRolInterno: idNuevoRol,
                    habilitadoPermiso: permisos[i]['habilitadoPermiso']
                })

                const permisoInterno = await PermisoInterno.findOne({
                    where: {
                        id: rolPermiso['dataValues']['fk_idPermisoInterno']
                    }
                })

                let permiso = {
                    idPermiso: permisoInterno['dataValues']['id'],
                    nombrePermiso: permisoInterno['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermiso['dataValues']['habilitadoPermiso']
                }

                permisosJson.push(permiso)
            }

            const rolResponse = {
                id: rolInterno['dataValues']['id'],
                nombreRol: rolInterno['dataValues']['nombreRol'],
                descripcionRol: rolInterno['dataValues']['descripcionRol'],
                activo: rolInterno['dataValues']['activo'],
                fk_idPersonaJuridica: rolInterno['dataValues']['fk_idPersonaJuridica'],
                permisos: permisosJson
            }

            res.status(200).json({
                msg: `Rol ${nombreRol} creado con id ${idNuevoRol}`,
                rolInterno: rolResponse
            })


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    getRolInternoById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idRolInterno } = req.params
            const rol = await RolInterno.findOne({
                where: {
                    id: idRolInterno,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!rol) {
                throw new Error("No existe el rol interno solicitado")
            }

            const rolPermiso = await RolInternoPermisoInterno.findAll({
                where: {
                    fk_idRolInterno: idRolInterno
                }
            })

            const permisosJson = []

            for (let j = 0; j < rolPermiso.length; j++) {

                const permisoInterno = await PermisoInterno.findOne({
                    where: {
                        id: rolPermiso[j]['dataValues']['fk_idPermisoInterno']
                    }
                })

                let permiso = {
                    idPermiso: permisoInterno['dataValues']['id'],
                    nombrePermiso: permisoInterno['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']
                }

                permisosJson.push(permiso)
            }

            const rolResponse = {
                id: rol['dataValues']['id'],
                nombreRol: rol['dataValues']['nombreRol'],
                descripcionRol: rol['dataValues']['descripcionRol'],
                activo: rol['dataValues']['activo'],
                fk_idPersonaJuridica: rol['dataValues']['fk_idPersonaJuridica'],
                permisos: permisosJson
            }

            res.status(200).json(rolResponse)


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }
    },

    updateRolInternoById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idRolInterno } = req.params
            const { body } = req

            const rolInterno = await RolInterno.findOne({
                where: {
                    id: idRolInterno,
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            if (!rolInterno) {
                return res.status(404).json({
                    msg: `Rol interno a editar no encontrado`
                })
            }

            await rolInterno.update(body)

            const permisosJson = []

            for (let x = 0; x < body.permisos.length; x++) {

                const rolPermisoUpdate = await RolInternoPermisoInterno.findOne({
                    where: {
                        fk_idRolInterno: idRolInterno,
                        fk_idPermisoInterno: body.permisos[x]["idPermiso"]
                    }
                })

                await rolPermisoUpdate.update({ habilitadoPermiso: body.permisos[x]['habilitadoPermiso'] })

                const permisoInterno = await PermisoInterno.findOne({
                    where: {
                        id: rolPermisoUpdate['dataValues']['fk_idPermisoInterno']
                    }
                })

                let permiso = {
                    idPermiso: permisoInterno['dataValues']['id'],
                    nombrePermiso: permisoInterno['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermisoUpdate['dataValues']['habilitadoPermiso']
                }

                permisosJson.push(permiso)

            }

            const rolResponse = {
                id: rolInterno['dataValues']['id'],
                nombreRol: rolInterno['dataValues']['nombreRol'],
                descripcionRol: rolInterno['dataValues']['descripcionRol'],
                activo: rolInterno['dataValues']['activo'],
                fk_idPersonaJuridica: rolInterno['dataValues']['fk_idPersonaJuridica'],
                permisos: permisosJson
            }

            res.status(200).json({
                msg: `Rol actualizado correctamente.`,
                rolInterno: rolResponse
            })


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    deleteRolInternoById: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { idPersonaJuridica, idRolInterno } = req.params

            const rolinternoToDelete = await RolInterno.findOne({
                where: {
                    id: idRolInterno,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (rolinternoToDelete) {

                rolinternoToDelete.update({ activo: false })

                res.status(200).json({
                    msg: "Rol interno eliminado"
                })

            } else {
                throw new Error(`La persona jurídica no contiene el rol seleccionado`)
            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    getPermisosInternos: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const permisosinternosAll = await PermisoInterno.findAll()

            if (!permisosinternosAll) {
                res.status(404).json({
                    msg: "No existen permisos"
                })
            }

            res.status(200).json(permisosinternosAll)



        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

}

export default rolesInternosController;

