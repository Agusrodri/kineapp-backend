import { Request, Response } from 'express';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';

const obrasSocialesController = {

    getObrasSociales: async (req: Request, res: Response) => {

        try {

            const obrasSociales = await ObraSocial.findAll({
                where: {
                    activo: true
                }
            })

            res.status(200).json(obrasSociales)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getPlanesObraSocial: async (req: Request, res: Response) => {

        try {

            const { idObraSocial } = req.params
            const planes = await Plan.findAll({
                where: {
                    fk_idObraSocial: idObraSocial,
                    activo: true
                }
            })

            res.status(200).json(planes)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }


    }

}

export default obrasSocialesController;