import { Request, Response } from 'express';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import { Op } from 'sequelize';

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
    }

}

export default obrasSocialesController;