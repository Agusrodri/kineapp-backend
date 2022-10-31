import { Request, Response } from 'express';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import Convenio from '../../models/entities/obrasSocialesModule/convenio';
import ConvenioTratamientoGeneral from '../../models/entities/obrasSocialesModule/convenioTratamientoGeneral';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import PlanTratamientoGeneral from '../../models/entities/obrasSocialesModule/planTratamientoGeneral';
import TratamientoGeneral from '../../models/entities/obrasSocialesModule/tratamientoGeneral';
import PjTratamientoGeneral from '../../models/entities/obrasSocialesModule/pjTratamientoGeneral'
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

            const conveniosResponse = []

            for (let i = 0; i < convenios.length; i++) {
                const conveniosTratamientoGenerales = await ConvenioTratamientoGeneral.findAll({
                    where: {
                        fk_idConvenio: convenios[i]['dataValues']['id'],
                        activo: true
                    }
                })

                const tratamientos = []

                for (let i = 0; i < conveniosTratamientoGenerales.length; i++) {

                    const tratamientoGeneral = await TratamientoGeneral.findOne({
                        where: {
                            id: conveniosTratamientoGenerales[i]['dataValues']['fk_idTratamientoGeneral'],
                            activo: true
                        }
                    })

                    if (!tratamientoGeneral) { continue }

                    const tratamientoToAdd = {
                        idTratamientoGeneral: tratamientoGeneral['dataValues']['id'],
                        nombre: tratamientoGeneral['dataValues']['nombre'],
                        monto: conveniosTratamientoGenerales[i]['dataValues']['monto']
                    }

                    tratamientos.push(tratamientoToAdd)
                }

                const convenioResp = {
                    id: convenios[i]['dataValues']['id'],
                    nombre: convenios[i]['dataValues']['nombre'],
                    descripcion: convenios[i]['dataValues']['descripcion'],
                    fk_idObraSocial: convenios[i]['dataValues']['fk_idObraSocial'],
                    fk_idPersonaJuridica: convenios[i]['dataValues']['fk_idPersonaJuridica'],
                    activo: convenios[i]['dataValues']['activo'],
                    tratamientos: tratamientos
                }

                conveniosResponse.push(convenioResp)

            }

            res.status(200).json(conveniosResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getConvenioById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica, idConvenio } = req.params
            const convenio = await Convenio.findOne({
                where: {
                    id: idConvenio,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!convenio) {
                throw new Error("No existe el convenio solicitado.")
            }

            const conveniosTratamientoGenerales = await ConvenioTratamientoGeneral.findAll({
                where: {
                    fk_idConvenio: idConvenio,
                    activo: true
                }
            })

            const tratamientos = []

            for (let i = 0; i < conveniosTratamientoGenerales.length; i++) {

                const tratamientoGeneral = await TratamientoGeneral.findOne({
                    where: {
                        id: conveniosTratamientoGenerales[i]['dataValues']['fk_idTratamientoGeneral'],
                        activo: true
                    }
                })

                const tratamientoToAdd = {
                    idTratamientoGeneral: tratamientoGeneral['dataValues']['id'],
                    nombre: tratamientoGeneral['dataValues']['nombre'],
                    monto: conveniosTratamientoGenerales[i]['dataValues']['monto']
                }

                tratamientos.push(tratamientoToAdd)
            }

            const convenioResp = {
                id: convenio['dataValues']['id'],
                nombre: convenio['dataValues']['nombre'],
                descripcion: convenio['dataValues']['descripcion'],
                fk_idObraSocial: convenio['dataValues']['fk_idObraSocial'],
                fk_idPersonaJuridica: convenio['dataValues']['fk_idPersonaJuridica'],
                activo: convenio['dataValues']['activo'],
                tratamientos: tratamientos
            }


            res.status(200).json(convenioResp)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    getTratamientosConvenio: async (req: Request, res: Response) => {

        try {

            const { idObraSocial, idPersonaJuridica } = req.params

            const planesObraSocial = await Plan.findAll({
                where: {
                    fk_idObraSocial: idObraSocial,
                    activo: true
                }
            })

            const tratamientos: any = []

            for (let i = 0; i < planesObraSocial.length; i++) {

                const planesTratamientosGrales = await PlanTratamientoGeneral.findAll({
                    where: {
                        fk_idPlan: planesObraSocial[i]['dataValues']['id']
                    }
                })

                if (!planesTratamientosGrales) { continue }

                for (let k = 0; k < planesTratamientosGrales.length; k++) {

                    const tratamientoGral = await TratamientoGeneral.findOne({
                        where: {
                            id: planesTratamientosGrales[k]['dataValues']['fk_idTratamientoGeneral'],
                            activo: true
                        }
                    })

                    if (!tratamientoGral) { continue }

                    const pjTratamientoGeneral = await PjTratamientoGeneral.findOne({
                        where: {
                            fk_idTratamientoGeneral: tratamientoGral!['dataValues']['id'] || 0,
                            fk_idPersonaJuridica: idPersonaJuridica,
                            activo: true
                        }
                    })

                    if (!pjTratamientoGeneral) {
                        continue
                    }

                    const tratamiento = {
                        idTratamientoGeneral: tratamientoGral!['dataValues']['id'],
                        nombre: tratamientoGral!['dataValues']['nombre']
                    }

                    if (tratamientos.find(tratamientoIndex => tratamientoIndex.idTratamientoGeneral === tratamiento.idTratamientoGeneral)) {
                        continue
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
                throw new Error("Ya existe un convenio entre esta obra social y la institución.")
            }

            const convenioToCreate = await Convenio.create({
                nombre: obraSocial['dataValues']['nombre'],
                descripcion: descripcion,
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idObraSocial: idObraSocial,
                activo: true
            })

            const tratamientosResponse = []
            for (let i = 0; i < tratamientos.length; i++) {

                const conveniosTratamientoGeneral = await ConvenioTratamientoGeneral.create({
                    monto: tratamientos[i]['monto'],
                    fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral'],
                    fk_idConvenio: convenioToCreate['dataValues']['id'],
                    activo: true
                })

                const tratamientoGeneral = await TratamientoGeneral.findOne({
                    where: {
                        id: conveniosTratamientoGeneral['dataValues']['fk_idTratamientoGeneral'],
                        activo: true
                    }
                })

                const tratamientoToAdd = {
                    idTratamientoGeneral: tratamientoGeneral['dataValues']['id'],
                    nombre: tratamientoGeneral['dataValues']['nombre'],
                    monto: conveniosTratamientoGeneral['dataValues']['monto']
                }

                tratamientosResponse.push(tratamientoToAdd)

            }

            const convenioResp = {
                id: convenioToCreate['dataValues']['id'],
                nombre: convenioToCreate['dataValues']['nombre'],
                descripcion: convenioToCreate['dataValues']['descripcion'],
                fk_idObraSocial: convenioToCreate['dataValues']['fk_idObraSocial'],
                fk_idPersonaJuridica: convenioToCreate['dataValues']['fk_idPersonaJuridica'],
                activo: convenioToCreate['dataValues']['activo'],
                tratamientos: tratamientosResponse
            }

            res.status(200).json({
                msg: "Convenio creado correctamente",
                convenio: convenioResp
            })


        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarConvenio: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params
            const { idObraSocial, descripcion, tratamientos } = req.body

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

            await convenioToFind.update({ descripcion: descripcion })

            if (!convenioToFind) {
                throw new Error("No existe el convenio indicado.")
            }

            await ConvenioTratamientoGeneral.destroy({
                where: {
                    fk_idConvenio: convenioToFind['dataValues']['id']
                }
            })

            const tratamientosResponse = []
            for (let i = 0; i < tratamientos.length; i++) {

                const conveniosTratamientoGeneral = await ConvenioTratamientoGeneral.create({
                    monto: tratamientos[i]['monto'],
                    fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral'],
                    fk_idConvenio: convenioToFind['dataValues']['id'],
                    activo: true
                })

                const tratamientoGeneral = await TratamientoGeneral.findOne({
                    where: {
                        id: conveniosTratamientoGeneral['dataValues']['fk_idTratamientoGeneral'],
                        activo: true
                    }
                })

                const tratamientoToAdd = {
                    idTratamientoGeneral: tratamientoGeneral['dataValues']['id'],
                    nombre: tratamientoGeneral['dataValues']['nombre'],
                    monto: conveniosTratamientoGeneral['dataValues']['monto']
                }

                tratamientosResponse.push(tratamientoToAdd)
            }

            const convenioResp = {
                id: convenioToFind['dataValues']['id'],
                nombre: convenioToFind['dataValues']['nombre'],
                descripcion: convenioToFind['dataValues']['descripcion'],
                fk_idObraSocial: convenioToFind['dataValues']['fk_idObraSocial'],
                fk_idPersonaJuridica: convenioToFind['dataValues']['fk_idPersonaJuridica'],
                activo: convenioToFind['dataValues']['activo'],
                tratamientos: tratamientosResponse
            }

            res.status(200).json({
                msg: "Convenio actualizado correctamente",
                convenio: convenioResp
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    },

    bajaConvenio: async (req: Request, res: Response) => {

        try {

            const { idConvenio, idPersonaJuridica } = req.params

            const convenioToDelete = await Convenio.findOne({
                where: {
                    id: idConvenio,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!convenioToDelete) {
                throw new Error("No existe el convenio indicado.")
            }

            await convenioToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Convenio eliminado correctamente"
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}

export default conveniosController
