import { Request, Response } from 'express';
import ConfiguracionTurnos from '../../models/entities/turnosModule/configuracionTurnos';
const configuracionTurnosController = {

    setConfiguracion: async (req: Request, res: Response) => {

        try{

            const {idPersonaJuridica} = req.params;

            const {horaInicioAtencion, horaFinAtencion, pacientesSimultaneos} = req.params;

            await ConfiguracionTurnos.destroy({
                where:{
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            const newConfigTurnos = await ConfiguracionTurnos.create({
                horaInicioAtencion: horaInicioAtencion,
                horaFinAtencion: horaFinAtencion,
                pacientesSimultaneos: pacientesSimultaneos,
                fk_idPersonaJuridica: idPersonaJuridica
            })

            res.status(200).json({
                msg: "Configuración creada correctamente",
                configuracion: newConfigTurnos
            })

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getConfigTurnos: async (req: Request, res: Response) => {

        try{

            const {idPersonaJuridica} = req.params;

            const configTurnos = await ConfiguracionTurnos.findOne({
                where:{
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            if(configTurnos){
                return res.status(200).json(configTurnos)
            }else{
                return res.status(200).json({
                    horaInicioAtencion: "",
                    horaFinAtencion: "",
                    pacientesSimultaneos: 0
                })
            }

        }catch(error){
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default configuracionTurnosController;