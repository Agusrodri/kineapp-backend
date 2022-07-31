import { NextFunction, Request, Response } from "express"
import RolInterno from "../models/entities/usersModule/rolInterno";
import Rol from "../models/entities/usersModule/rol";

const dbValidators = {

    runNextMiddleware: async (req: Request, res: Response, next: NextFunction) => {

        req.shouldRunNextMiddleware = true
        next()

    },

    existsRolWithName: async (req: Request, res: Response, next: NextFunction) => {

        try {

            if (!req.shouldRunNextMiddleware) {

                next()

            } else {

                const { nombreRol } = req.body

                const rol = await Rol.findAll({
                    where: {
                        nombreRol: nombreRol,
                        activo: true
                    }
                })

                if (rol.length > 0) {
                    throw new Error(`El rol con nombre ${nombreRol} ya existe`)
                }

                next()

            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    isCurrentRol: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { id } = req.params

            const { nombreRol } = req.body

            const rol = await Rol.findAll({
                attributes: ['nombreRol'],
                where: {
                    id: id,
                    nombreRol: nombreRol
                }
            })

            if (rol.length > 0) {

                req.shouldRunNextMiddleware = false
                next()

            } else {
                req.shouldRunNextMiddleware = true
                next()
            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            })
        }

    },

    existsRolInternoWithName: async (req: Request, res: Response, next: NextFunction) => {

        try {

            if (!req.shouldRunNextMiddleware) {

                next()

            } else {

                const { idPersonaJuridica } = req.params

                const { nombreRol } = req.body

                const rol = await RolInterno.findAll({
                    where: {
                        nombreRol: nombreRol,
                        fk_idPersonaJuridica: idPersonaJuridica,
                        activo: true
                    }
                })

                if (rol.length > 0) {
                    throw new Error(`El rol con nombre ${nombreRol} ya existe`)
                }

                next()

            }

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    isCurrentRolInterno: async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { idRolInterno } = req.params

            const { nombreRol } = req.body

            const rol = await RolInterno.findAll({
                attributes: ['nombreRol'],
                where: {
                    id: idRolInterno,
                    nombreRol: nombreRol
                }
            })

            if (rol.length > 0) {

                req.shouldRunNextMiddleware = false
                next()

            } else {
                req.shouldRunNextMiddleware = true
                next()
            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            })
        }

    },


}

export default dbValidators;