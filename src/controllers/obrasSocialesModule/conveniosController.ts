import { Request, Response } from 'express';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import Convenio from '../../models/entities/obrasSocialesModule/convenio';
import ConvenioTratamientoGeneral from '../../models/entities/obrasSocialesModule/convenioTratamientoGeneral';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import PlanTratamientoGeneral from '../../models/entities/obrasSocialesModule/planTratamientoGeneral';
import TratamientoGeneral from '../../models/entities/obrasSocialesModule/tratamientoGeneral';

const conveniosController = {

    getConvenios: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            const convenios = await Convenio.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!convenios) {
                throw new Error("No existen convenios cargados.")
            }

            res.status(200).json(convenios)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    getTratamientosConvenio: async (req: Request, res: Response) => {

        try {

            const { idObraSocial } = req.params

            const planesObraSocial = await Plan.findAll({
                where: {
                    fk_idObraSocial: idObraSocial,
                    activo: true
                }
            })

            const tratamientos = []

            for (let i = 0; i < planesObraSocial.length; i++) {

                const planesTratamientosGrales = await PlanTratamientoGeneral.findAll({
                    where: {
                        fk_idPlan: planesObraSocial[i]['dataValues']['id']
                    }
                })

                for (let k = 0; k < planesTratamientosGrales.length; k++) {

                    const tratamientoGral = await TratamientoGeneral.findOne({
                        where: {
                            id: planesTratamientosGrales[k]['dataValues']['fk_idTratamientoGeneral'],
                            activo: true
                        }
                    })

                    const tratamiento = {
                        idTratamientoGeneral: tratamientoGral['dataValues']['id'],
                        nombre: tratamientoGral['dataValues']['nombre']
                    }

                    tratamientos.push(tratamiento)

                }
            }

            res.status(200).json(tratamientos)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }


    },

    agregarConvenio: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { idObraSocial, descripcion, tratamientos } = req.body

            /*  const tratamientos = [{
                 idTratamientoGeneral: 1,
                 monto: 3.5
             }] */

            const obraSocial = await ObraSocial.findOne({
                where: {
                    id: idObraSocial,
                    activo: true
                }
            })

            if (!obraSocial) {
                throw new Error("No existe la obra social indicada.")
            }

            const convenioToFind = await Convenio.findOne({
                where: {
                    fk_idObraSocial: idObraSocial,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (convenioToFind) {
                throw new Error("Ya existe un convenio con esta obra social y la institución.")
            }

            const convenioToCreate = await Convenio.create({
                nombre: obraSocial['dataValues']['nombre'],
                descripcion: descripcion,
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idObraSocial: idObraSocial,
                activo: true
            })

            for (let i = 0; i < tratamientos.length; i++) {

                await ConvenioTratamientoGeneral.create({
                    monto: tratamientos[i]['monto'],
                    fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral'],
                    fk_idConvenio: convenioToCreate['dataValues']['id'],
                    activo: true
                })

            }

            res.status(200).json({
                msg: "Convenio creado con éxito."
            })


        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default conveniosController
