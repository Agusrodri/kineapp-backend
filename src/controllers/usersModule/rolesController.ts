import { Request, Response } from "express"

import Rol from "../../models/entities/rol";

const rolesController = {

    getRoles: async (req: Request, res: Response) => {

        const roles = await Rol.findAll()

        if (!roles) {
            res.status(404).json({
                msg: "No existen roles"
            })
        }

        res.json({
            roles
        })

    }

}

export default rolesController;





