import { Request, Response } from 'express';
import Ejercicio from '../../models/entities/tratamientosModule/ejercicio';

const ejerciciosController = {

    getEjercicios: async (req: Request, res: Response) => {

        try{

            const {idPersonaJuridica} = req.params
            const ejercicios = await Ejercicio.findAll({
                where:{
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if(!ejercicios){
                throw new Error("No existen ejercicios cargados en la institución.")
            }
            
            res.status(200).json(ejercicios)
        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default ejerciciosController;