import { Request, Response } from "express"
import PjTratamientoGeneral from "../../models/entities/obrasSocialesModule/pjTratamientoGeneral";
import TratamientoParticular from "../../models/entities/obrasSocialesModule/tratamientoParticular";

const tratamientosParticularesController = {

    getTratamientosParticulares: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const tratamientosParticulares = await TratamientoParticular.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (tratamientosParticulares.length == 0) {
                throw new Error("No existen tratamientos particulares cargados.")
            }

            res.status(200).json(tratamientosParticulares)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getTratamientoParticularById: async (req: Request, res: Response) => {

        try {

            const { idTratamientoParticular, idPersonaJuridica } = req.params

            const tratamientoParticular = await TratamientoParticular.findOne({
                where: {
                    id: idTratamientoParticular,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!tratamientoParticular) {
                throw new Error("No existe el tratamiento particular solicitado.")
            }

            res.status(200).json(tratamientoParticular)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    agregarTratamientoParticular: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { nombre, monto, descripcion, idTratamientoGeneral } = req.body

            const tratamientoParticular = await TratamientoParticular.findOne({
                where: {
                    nombre: nombre,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (tratamientoParticular) {
                throw new Error("Ya existe un tratamiento particular con ese nombre dentro de la institución.")
            }

            if (idTratamientoGeneral) {

                const pjTratamientoGeneral = await PjTratamientoGeneral.create({
                    fk_idTratamientoGeneral: idTratamientoGeneral,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                })

            }

            const nuevotratamientoParticular = await TratamientoParticular.create({
                nombre: nombre,
                monto: monto,
                descripcion: descripcion,
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idTratamientoGeneral: (idTratamientoGeneral ? idTratamientoGeneral : null),
                activo: true
            })

            res.status(200).json({
                msg: "Tratamiento particular agregado con éxito.",
                nuevotratamientoParticular
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarTratamientoParticular: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { idTratamientoParticular, monto, descripcion } = req.body

            const tratamientoToEdit = await TratamientoParticular.findOne({
                where: {
                    id: idTratamientoParticular,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!tratamientoToEdit) {
                throw new Error("No existe el tratamiento particular solicitado.")
            }

            await tratamientoToEdit.update({ monto: monto, descripcion: descripcion })

            res.status(200).json({
                msg: "Tratamiento particular actualizado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarTratamientoParticular: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idTratamientoParticular } = req.params

            const tratamientoParticularToDelete = await TratamientoParticular.findOne({
                where: {
                    id: idTratamientoParticular,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!tratamientoParticularToDelete) {
                throw new Error("No existe el tratamiento particular indicado.")
            }

            await tratamientoParticularToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Tratamiento partiular eliminado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default tratamientosParticularesController;