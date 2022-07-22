import { NextFunction, Request, Response } from "express"
import { Op, Sequelize, where } from "sequelize"
import RolInterno from "../../models/entities/rolInterno"
import RolInternoPermisoInterno from "../../models/entities/rolInternoPermisoInterno"
import PersonaJuridica from "../../models/entities/personaJuridica"
import PermisoInterno from "../../models/entities/permisoInterno"


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

            res.status(200).json(
                rolesinternos
            )


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

            await RolInterno.create({
                nombreRol: nombreRol,
                descripcionRol: descripcionRol,
                fk_idPersonaJuridica: idPersonaJuridica,
                activo: true
            })

            const findIdNuevoRol = await RolInterno.findOne({
                attributes: ["id"],
                where: {
                    nombreRol: nombreRol,
                    descripcionRol: descripcionRol,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            const idNuevoRol = findIdNuevoRol['dataValues']['id']

            for (let i = 0; i < permisos.length; i++) {

                await RolInternoPermisoInterno.create({
                    fk_idPermisoInterno: permisos[i]['idPermiso'],
                    fk_idRolInterno: idNuevoRol,
                    habilitadoPermiso: permisos[i]['habilitadoPermiso']
                })

            }

            res.status(200).json({
                msg: `Rol ${nombreRol} creado con id ${idNuevoRol}`
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

            const rol = await RolInterno.findAll({
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
                attributes: ['habilitadoPermiso', 'fk_idPermisoInterno'],
                where: {
                    fk_idRolInterno: idRolInterno
                }
            })

            const idPermisos = []

            for (let i = 0; i < rolPermiso.length; i++) {
                idPermisos[i] = rolPermiso[i]['dataValues']['fk_idPermisoInterno']
            }

            const permisos = await PermisoInterno.findAll({
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

            for (let x = 0; x < body.permisos.length; x++) {

                const rolPermisoUpdate = await RolInternoPermisoInterno.findOne({
                    where: {
                        fk_idRolInterno: idRolInterno,
                        fk_idPermisoInterno: body.permisos[x]["idPermiso"]
                    }
                })

                await rolPermisoUpdate.update({ habilitadoPermiso: body.permisos[x]['habilitadoPermiso'] })

            }

            res.status(200).json({
                msg: `Rol actualizado`

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

