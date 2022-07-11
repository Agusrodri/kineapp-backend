
import { Request, Response } from "express"


const userController = {

    usersGet: async (req: Request, res: Response) => {

        res.json({
            msg: "Get works!"
        })



    }


}


export default userController;