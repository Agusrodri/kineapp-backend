import { NextFunction, Request, Response } from "express"
import { Op, Sequelize, where } from "sequelize"
import RolInterno from "../../models/entities/rolInterno"
import RolInternoPermisoInterno from "../../models/entities/rolInternoPermisoInterno"
import PersonaJuridica from "../../models/entities/personaJuridica"
import PjRolInterno from "../../models/entities/pjRolInterno"


const rolesInternosController = {

    getRolesInternos: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            const pjrolinternos = await PjRolInterno.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            }
            )

            const rolesInternos = []

            for (let i = 0; i < pjrolinternos.length; i++) {

                let rolInterno = await RolInterno.findAll({
                    where: {
                        id: pjrolinternos[i]['dataValues']['fk_idRolInterno']
                    }
                })

                rolesInternos[i] = rolInterno[0]['dataValues']

            }

            res.status(200).json(
                rolesInternos
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
                nombreRolInterno: nombreRol,
                descripcion: descripcionRol,
                activo: true
            })

            const findIdNuevoRol = await RolInterno.findOne({
                attributes: ["id"],
                where: {
                    nombreRolInterno: nombreRol,
                    descripcion: descripcionRol,
                    activo: true
                }
            })

            const idNuevoRol = findIdNuevoRol['dataValues']['id']

            for (let i = 0; i < permisos.length; i++) {

                await RolInternoPermisoInterno.create({
                    fk_idPermisoInterno: permisos[i]['idPermiso'],
                    fk_idRolInterno: idNuevoRol,
                    habilitado: permisos[i]['habilitadoPermiso']
                })

            }

            await PjRolInterno.create({
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idRolInterno: idNuevoRol
            })

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



        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    updateRolInternoById: async (req: Request, res: Response) => {

        try {


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

            const pjrolinterno = await PjRolInterno.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idRolInterno: idRolInterno,
                    activo: true
                }
            })

            if (pjrolinterno) {

                pjrolinterno.update({ activo: false })

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



        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

}

export default rolesInternosController;

