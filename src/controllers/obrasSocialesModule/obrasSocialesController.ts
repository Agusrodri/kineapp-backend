import { Request, Response } from 'express';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import { Op } from 'sequelize';
import PlanTratamientoGeneral from '../../models/entities/obrasSocialesModule/planTratamientoGeneral';
import TratamientoGeneral from '../../models/entities/obrasSocialesModule/tratamientoGeneral';

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
    },

    createObraSocial: async (req: Request, res: Response) => {

        try {

            const { nombre, razonSocial, cuit, domicilio, telefono, email } = req.body
            const obraSocial = await ObraSocial.findOne({
                where: {
                    [Op.or]: [
                        { nombre: nombre },
                        { cuit: cuit },
                        { razonSocial: razonSocial },
                        { email: email }
                    ]
                }
            })

            if (!obraSocial) {

                await ObraSocial.create({
                    nombre: nombre,
                    razonSocial: razonSocial,
                    cuit: cuit,
                    domicilio: domicilio,
                    telefono: telefono,
                    email: email,
                    activo: true
                })

            } else if (obraSocial['dataValues']['nombre'] === nombre) {
                throw new Error("El nombre que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese un nombre diferente.")
            } else if (obraSocial['dataValues']['cuit'] === cuit) {
                throw new Error("El CUIT que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese un CUIT diferente.")
            } else if (obraSocial['dataValues']['razonSocial'] === razonSocial) {
                throw new Error("La razón social que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese una razón social diferente.")
            } else if (obraSocial['dataValues']['email'] === email) {
                throw new Error("El email que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese un email diferente.")
            }

            res.status(200).json({
                msg: "Obra social creada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getObraSocialById: async (req: Request, res: Response) => {

        try {

            const { idObraSocial } = req.params
            const obraSocial = await ObraSocial.findByPk(idObraSocial)

            if (!obraSocial) {
                throw new Error("No existe la obra social solicitada.")
            }

            res.status(200).json(obraSocial)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editObraSocialById: async (req: Request, res: Response) => {

        try {

            const { idObraSocial } = req.params
            const { nombre, razonSocial, cuit, domicilio, telefono, email } = req.body

            const obraSocialToEdit = await ObraSocial.findOne({
                where: {
                    id: idObraSocial,
                    activo: true
                }
            })

            if (!obraSocialToEdit) {
                throw new Error("No existe la obra social solicitada")
            }

            const obrasSocialesToCompare = await ObraSocial.findOne({
                where: {
                    id: {
                        [Op.notIn]: [idObraSocial]
                    },
                    [Op.or]: [
                        { nombre: nombre },
                        { cuit: cuit },
                        { razonSocial: razonSocial },
                        { email: email }
                    ]
                }
            })

            if (!obrasSocialesToCompare) {

                await obraSocialToEdit.update({
                    nombre: nombre,
                    razonSocial: razonSocial,
                    cuit: cuit,
                    domicilio: domicilio,
                    telefono: telefono,
                    email: email
                })

            } else if (obrasSocialesToCompare['dataValues']['nombre'] === nombre) {
                throw new Error("El nombre que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese un nombre diferente.")
            } else if (obrasSocialesToCompare['dataValues']['cuit'] === cuit) {
                throw new Error("El CUIT que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese un CUIT diferente.")
            } else if (obrasSocialesToCompare['dataValues']['razonSocial'] === razonSocial) {
                throw new Error("La razón social que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese una razón social diferente.")
            } else if (obrasSocialesToCompare['dataValues']['email'] === email) {
                throw new Error("El email que desea agregar ya está en uso, compruebe si la obra social ya está cargada o ingrese un email diferente.")
            }

            res.status(200).json({
                msg: "Obra social actualizada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    deleteObraSocialById: async (req: Request, res: Response) => {

        try {

            const { idObraSocial } = req.params
            const obraSocialToDelete = await ObraSocial.findByPk(idObraSocial)

            if (!obraSocialToDelete) {
                throw new Error("No existe la obra social solicitada.")
            }

            await obraSocialToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Obra social eliminada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getPlanById: async (req: Request, res: Response) => {

        try {

            const { idPlan } = req.params
            const plan = await Plan.findOne({
                where: {
                    id: idPlan,
                    activo: true
                }
            })

            if (!plan) {
                throw new Error("No se encontró el plan indicado.")
            }

            const planTratamientoGeneral = await PlanTratamientoGeneral.findAll({
                where: {
                    fk_idPlan: idPlan
                }
            })

            const coberturas = []

            for (let i = 0; i < planTratamientoGeneral.length; i++) {

                const tratamiento = await TratamientoGeneral.findOne({
                    where: {
                        id: planTratamientoGeneral[i]['dataValues']['fk_idTratamientoGeneral'],
                        activo: true
                    }
                })

                const cobertura = {
                    idTratamiento: tratamiento['dataValues']['id'],
                    tratamiento: tratamiento['dataValues']['nombre'],
                    porcentajeCobertura: planTratamientoGeneral[i]['dataValues']['porcentajeCobertura'],
                    comentarios: planTratamientoGeneral[i]['dataValues']['comentarios']
                }

                coberturas.push(cobertura)
            }

            const planResponse = {
                idPlan: plan['dataValues']['id'],
                nombre: plan['dataValues']['nombre'],
                coberturas: coberturas
            }

            res.status(200).json(planResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    agregarPlan: async (req: Request, res: Response) => {

        try {

            const { idObraSocial } = req.params
            const { nombre } = req.body

            const obraSocialToFind = await ObraSocial.findOne({
                where: {
                    id: idObraSocial,
                    activo: true
                }
            })

            if (!obraSocialToFind) {
                throw new Error("No existe la obra social solicitada.")
            }

            const planToFind = await Plan.findOne({
                where: {
                    nombre: nombre,
                    fk_idObraSocial: idObraSocial,
                    activo: true
                }
            })

            if (planToFind) {
                throw new Error("El nombre del plan que desea agregar ya existe en esta obra social, intenta nuevamente.")
            }

            await Plan.create({
                nombre: nombre,
                fk_idObraSocial: idObraSocial,
                activo: true
            })

            res.status(200).json({
                msg: "Plan creado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    agregarTratamientos: async (req: Request, res: Response) => {

        try {

            const { idPlan } = req.params
            const { tratamientos } = req.body

            for (let i = 0; i < tratamientos.length; i++) {

                const planTratamientoGeneralToFind = await PlanTratamientoGeneral.findOne({
                    where: {
                        fk_idPlan: idPlan,
                        fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral']
                    }
                })

                if (planTratamientoGeneralToFind) {
                    throw new Error("El tratamiento ya se encuentra asociado al plan indicado.")
                }

                await PlanTratamientoGeneral.create({
                    porcentajeCobertura: tratamientos[i]['porcentajeCobertura'],
                    comentarios: tratamientos[i]['comentarios'],
                    fk_idPlan: idPlan,
                    fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral']
                })

            }

            res.status(200).json({
                msg: "El tratamiento se agregó al plan correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}

export default obrasSocialesController;