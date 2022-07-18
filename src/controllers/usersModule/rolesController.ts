import { NextFunction, Request, Response } from "express"
import { Op, Sequelize } from "sequelize"

import Rol from "../../models/entities/rol";
import RolPermiso from "../../models/entities/rolPermiso";
import Permiso from "../../models/entities/permiso";


const rolesController = {

    getRoles: async (req: Request, res: Response) => {

        try {

            const roles = await Rol.findAll({
                where: {
                    activo: true
                }
            })

            if (!roles) {
                res.status(404).json({
                    msg: "No existen roles"
                })
            }

            res.status(200).json(roles)

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

            const findIdNuevoRol = await Rol.findOne({
                attributes: ["id"],
                where: {
                    nombreRol: nombreRol,
                    descripcionRol: descripcionRol
                }
            })

            const idNuevoRol = findIdNuevoRol['dataValues']['id']

            for (let i = 0; i < permisos.length; i++) {

                await RolPermiso.create({
                    fk_idPermiso: permisos[i]['idPermiso'],
                    fk_idRol: idNuevoRol,
                    habilitadoPermiso: permisos[i]['habilitadoPermiso']
                })

            }

            res.status(200).json({
                msg: `Rol con nombre -${nombreRol}- y id -${idNuevoRol}- creado`
            })


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
            });

        }

    },

    getRolById: async (req: Request, res: Response) => {

        try {

            const { id } = req.params

            const rol = await Rol.findAll({
                attributes: ['nombreRol', 'descripcionRol'],
                where: {
                    id: id
                }
            })

            const rolPermiso = await RolPermiso.findAll({
                attributes: ['habilitadoPermiso', 'fk_idPermiso'],
                where: {
                    fk_idRol: id
                }
            })

            const idPermisos = []

            for (let i = 0; i < rolPermiso.length; i++) {
                idPermisos[i] = rolPermiso[i]['dataValues']['fk_idPermiso']

            }

            const permisos = await Permiso.findAll({
                attributes: ['id', 'nombrePermiso'],
                where: {
                    id: {
                        [Op.or]: idPermisos
                    }
                }
            })

            const permisosJson = []

            for (let j = 0; j < rolPermiso.length; j++) {

                let permisoJson = {
                    idPermiso: permisos[j]['dataValues']['id'],
                    nombrePermiso: permisos[j]['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']
                }

                permisosJson.push(permisoJson)
            }

            res.status(200).json({
                rol,
                permisosJson
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
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
                    msg: `Rol con id ${id} no encontrado`
                })
            }

            await rol.update(body)

            for (let x = 0; x < body.permisos.length; x++) {

                const rolPermisoUpdate = await RolPermiso.findOne({
                    where: {
                        [Op.and]: [
                            { fk_idRol: id },
                            { fk_idPermiso: body.permisos[x]["idPermiso"] }
                        ]
                    }
                })

                rolPermisoUpdate.update(body.permisos[x])

            }

            res.status(200).json({
                msg: `Rol con id ${id} actualizado`

            })

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
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

            rolToDelete.update({ activo: false })

            res.status(200).json({
                msg: `Rol con id ${id} eliminado`
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

}

export default rolesController;

