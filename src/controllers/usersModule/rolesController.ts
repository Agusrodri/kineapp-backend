import { NextFunction, Request, Response } from "express"
import { Op, Sequelize } from "sequelize"
import Rol from "../../models/entities/usersModule/rol";
import RolPermiso from "../../models/entities/usersModule/rolPermiso";
import Permiso from "../../models/entities/usersModule/permiso";
import findRoles from "../../helpers/findRoles";
import findRolesInternos from "../../helpers/findRolesInternos";
import Usuario from "../../models/entities/usersModule/usuario";

const rolesController = {

    getRoles: async (req: Request, res: Response) => {

        try {

            const roles = await Rol.findAll({
                where: {
                    id: { [Op.notIn]: [1, 74] },
                    activo: true
                }
            })

            if (!roles) {
                res.status(404).json({
                    msg: "No existen roles"
                })
            }

            const rolesResponse = []

            for (let i = 0; i < roles.length; i++) {

                const rolPermiso = await RolPermiso.findAll({
                    where: {
                        fk_idRol: roles[i]['dataValues']['id']
                    }
                })

                const permisosJson = []

                for (let j = 0; j < rolPermiso.length; j++) {

                    const permiso = await Permiso.findOne({
                        where: {
                            id: rolPermiso[j]['dataValues']['fk_idPermiso']
                        }
                    })

                    let permisoJson = {
                        idPermiso: permiso['dataValues']['id'],
                        nombrePermiso: permiso['dataValues']['nombrePermiso'],
                        habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']
                    }

                    permisosJson.push(permisoJson)
                }

                const response = {
                    id: roles[i]['dataValues']['id'],
                    nombreRol: roles[i]['dataValues']['nombreRol'],
                    descripcionRol: roles[i]['dataValues']['descripcionRol'],
                    activo: roles[i]['dataValues']['activo'],
                    permisos: permisosJson
                }

                rolesResponse.push(response)

            }

            res.status(200).json(rolesResponse)

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
            });
        }
    },

    createRol: async (req: Request, res: Response) => {

        try {

            const { nombreRol, descripcionRol, permisos } = req.body

            const nuevoRol = await Rol.create({
                nombreRol: nombreRol,
                descripcionRol: descripcionRol,
                activo: true
            })

            const idNuevoRol = nuevoRol['dataValues']['id']
            const permisosJson = []

            for (let i = 0; i < permisos.length; i++) {

                const permisoRol = await RolPermiso.create({
                    fk_idPermiso: permisos[i]['idPermiso'],
                    fk_idRol: idNuevoRol,
                    habilitadoPermiso: permisos[i]['habilitadoPermiso']
                })

                permisosJson.push(permisoRol)
            }

            const response = {
                id: nuevoRol['dataValues']['id'],
                nombreRol: nuevoRol['dataValues']['nombreRol'],
                descripcionRol: nuevoRol['dataValues']['descripcionRol'],
                activo: nuevoRol['dataValues']['activo'],
                permisos: permisosJson
            }

            res.status(200).json({
                msg: "Rol creado correctamente",
                nuevoRol: response
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    getRolById: async (req: Request, res: Response) => {

        try {

            const { id } = req.params

            const rol = await Rol.findOne({
                where: {
                    id: id
                }
            })

            if (!rol) {
                throw new Error("No existe el rol solicitado.")
            }

            const rolPermiso = await RolPermiso.findAll({
                where: {
                    fk_idRol: id
                }
            })

            const permisosJson = []

            for (let j = 0; j < rolPermiso.length; j++) {

                const permiso = await Permiso.findOne({
                    where: {
                        id: rolPermiso[j]['dataValues']['fk_idPermiso']
                    }
                })

                let permisoJson = {
                    idPermiso: permiso['dataValues']['id'],
                    nombrePermiso: permiso['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']
                }

                permisosJson.push(permisoJson)
            }

            const response = {
                id: rol['dataValues']['id'],
                nombreRol: rol['dataValues']['nombreRol'],
                descripcionRol: rol['dataValues']['descripcionRol'],
                activo: rol['dataValues']['activo'],
                permisos: permisosJson
            }

            res.status(200).json(response)

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Ocurrió un error inesperado. Por favor, intente nuevamente más tarde.'
            });

        }

    },

    updateRolById: async (req: Request, res: Response) => {

        try {

            const { id } = req.params
            const { body } = req
            const rol = await Rol.findByPk(id)

            if (!rol) {
                return res.status(404).json({
                    msg: `Rol no encontrado`
                })
            }

            await rol.update(body)

            for (let x = 0; x < body.permisos.length; x++) {

                const rolPermisoToUpdate = await RolPermiso.findOne({
                    where: {
                        fk_idRol: id,
                        fk_idPermiso: body.permisos[x]["idPermiso"]
                    }
                })

                await rolPermisoToUpdate.update(body.permisos[x])

            }

            const rolPermiso = await RolPermiso.findAll({
                where: {
                    fk_idRol: id
                }
            })

            const permisosJson = []

            for (let j = 0; j < rolPermiso.length; j++) {

                const permiso = await Permiso.findOne({
                    where: {
                        id: rolPermiso[j]['dataValues']['fk_idPermiso']
                    }
                })

                let permisoJson = {
                    idPermiso: permiso['dataValues']['id'],
                    nombrePermiso: permiso['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']
                }

                permisosJson.push(permisoJson)
            }

            const response = {
                id: rol['dataValues']['id'],
                nombreRol: rol['dataValues']['nombreRol'],
                descripcionRol: rol['dataValues']['descripcionRol'],
                activo: rol['dataValues']['activo'],
                permisos: permisosJson
            }

            res.status(200).json({
                msg: `Rol actualizado correctamente`,
                rol: response
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    deleteRolById: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { id } = req.params

            const rolToDelete = await Rol.findOne({
                where: {
                    id: id
                }
            })

            if (!rolToDelete) {
                throw new Error(`Error: no existe el rol con id -${id}-`)

            }

            await rolToDelete.update({ activo: false });

            const usuarios = await Usuario.findAll({
                where: {
                    rolActivo: id
                }
            })

            if (usuarios) {
                for (let index = 0; index < usuarios.length; index++) {

                    await usuarios[index].update({ token: null })

                }
            }

            res.status(200).json({
                msg: `Rol eliminado correctamente`
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    getPermisos: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const permisosAll = await Permiso.findAll()

            if (!permisosAll) {
                res.status(404).json({
                    msg: "No existen permisos"
                })
            }

            res.status(200).json(permisosAll)

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
            });

        }

    },

    getRolesUsuario: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { idUsuario } = req.params
            const roles = await findRoles(Number(idUsuario))
            const rolesInternos = await findRolesInternos(Number(idUsuario))
            res.status(200).json({ roles, rolesInternos })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default rolesController;

