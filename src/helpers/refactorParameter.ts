import { NextFunction, Request, Response } from "express"

const refactors = {

    refactorNombreRol: async (req: Request, res: Response, next: NextFunction) => {

        let { nombreRol } = req.body

        nombreRol = nombreRol.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        nombreRol = nombreRol.replace(/\s/g, '-')

        req.body['nombreRol'] = nombreRol.toLowerCase()

        next()


    }

}

export default refactors;