import { Request, Response } from 'express';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import Rutina from '../../models/entities/tratamientosModule/rutina';
import RutinaEjercicio from '../../models/entities/tratamientosModule/rutinaEjercicio';

const rutinaController = {

    createRutina: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params
            const ejercicios = req.body //consultar si pasar también el orden

            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true,
                    finalizado: false
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")
            }

            const newRutina = await Rutina.create({
                //order: 
                fk_idTratamientoPaciente: idTratamientoPaciente,
                activo: true
            })

            const ejerciciosRutina = []

            for (let i = 0; i < ejercicios.length; i++) {

                const newRutinaEjercicio = await RutinaEjercicio.create({
                    duracion: ejercicios[i]['duracion'],
                    cantidadRepeticiones: ejercicios[i]['cantidadRepeticiones'],
                    //contadorCheck:
                    fk_idRutina: newRutina['dataValues']['id'],
                    fk_idEjercicio: ejercicios[i]['fk_idEjercicio']
                })

                ejerciciosRutina.push(newRutinaEjercicio)

            }

            const rutinaResponse = {
                id: newRutina['dataValues']['id'],
                orden: newRutina['dataValues']['orden'],
                idTratamientoPaciente: newRutina['dataValues']['fk_idTratamientoPaciente'],
                activo: newRutina['dataValues']['activo'],
                ejercicios: ejerciciosRutina

            }

            res.status(200).json(rutinaResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default rutinaController;