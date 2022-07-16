import { NextFunction, Request, Response } from "express"
import Rol from "../models/entities/rol";

const dbValidators = {

    existsRolWithName: async (req: Request, res: Response, next: NextFunction) => {

        try {

            if (!req.shouldRunNextMiddleware) {

                next()

            } else {

                const { nombreRol } = req.body

                const rol = await Rol.findAll({
                    where: {
                        nombreRol: nombreRol
                    }
                })

                if (rol.length > 0) {
                    throw new Error(`El rol con nombre -${nombreRol}- ya existe`)
                }


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




    }

}

export default dbValidators;