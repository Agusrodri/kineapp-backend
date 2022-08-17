import { Request, Response } from "express"
import TratamientoParticular from "../../models/entities/obrasSocialesModule/tratamientoParticular";

const tratamientosParticularesController = {

    getTratamientosParticulares: async (req: Request, res: Response) => {

        try{

            const {idPersonaJuridica} = req.params
            const tratamientosParticulares = await TratamientoParticular.findAll({
                where:{
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if(tratamientosParticulares.length == 0){
                throw new Error("No existen tratamientos particulares cargados.")
            }

            res.status(200).json(tratamientosParticulares)

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default tratamientosParticularesController;