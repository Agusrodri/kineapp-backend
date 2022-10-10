import { Request, Response } from 'express';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import { Op } from 'sequelize';
import PlanTratamientoGeneral from '../../models/entities/obrasSocialesModule/planTratamientoGeneral';
import TratamientoGeneral from '../../models/entities/obrasSocialesModule/tratamientoGeneral';
import Paciente from '../../models/entities/usersModule/paciente';
import Usuario from '../../models/entities/usersModule/usuario';
import sendNotification from '../../helpers/sendNotification';
import Notificacion from '../../models/entities/usersModule/notificacion';

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

            const response = []

            for (let i = 0; i < planes.length; i++) {

                const planTratamientoGeneral = await PlanTratamientoGeneral.findAll({
                    where: {
                        fk_idPlan: planes[i]['dataValues']['id']
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

                    if (!tratamiento) { continue }

                    const cobertura = {
                        idTratamiento: tratamiento['dataValues']['id'],
                        tratamiento: tratamiento['dataValues']['nombre'],
                        porcentajeCobertura: planTratamientoGeneral[i]['dataValues']['porcentajeCobertura'],
                        comentarios: planTratamientoGeneral[i]['dataValues']['comentarios']
                    }

                    coberturas.push(cobertura)
                }

                response.push({
                    id: planes[i]['dataValues']['id'],
                    nombre: planes[i]['dataValues']['nombre'],
                    fk_idObraSocial: planes[i]['dataValues']['fk_idObraSocial'],
                    activo: planes[i]['dataValues']['activo'],
                    createdAt: planes[i]['dataValues']['createdAt'],
                    updatedAt: planes[i]['dataValues']['updatedAt'],
                    coberturas
                })
            }
            res.status(200).json(response)
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
                    ],
                    activo: true
                }
            })

            if (!obraSocial) {

                const obraSocialToCreate = await ObraSocial.create({
                    nombre: nombre,
                    razonSocial: razonSocial,
                    cuit: cuit,
                    domicilio: domicilio,
                    telefono: telefono,
                    email: email,
                    activo: true
                })

                res.status(200).json({
                    msg: "Obra social creada con éxito.",
                    obraSocial: obraSocialToCreate
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
            const obraSocialToDelete = await ObraSocial.findOne({
                where: {
                    id: idObraSocial,
                    activo: true
                }
            })

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

            const nuevoPlan = await Plan.create({
                nombre: nombre,
                fk_idObraSocial: idObraSocial,
                activo: true
            })

            res.status(200).json({
                msg: "Plan creado correctamente.",
                nuevoPlan
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

            let tratamientosNotificacion = []
            for (let i = 0; i < tratamientos.length; i++) {

                const planTratamientoGeneralToFind = await PlanTratamientoGeneral.findOne({
                    where: {
                        fk_idPlan: idPlan,
                        fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral']
                    }
                })

                const tratamientoGeneral = await TratamientoGeneral.findByPk(tratamientos[i]['idTratamientoGeneral']);
                tratamientosNotificacion.push(tratamientoGeneral['dataValues']['nombre']);

                if (planTratamientoGeneralToFind) {
                    throw new Error(`El tratamiento ${tratamientoGeneral['dataValues']['nombre']} ya se encuentra asociado al plan indicado, intente nuevamente.`)
                }

                await PlanTratamientoGeneral.create({
                    porcentajeCobertura: tratamientos[i]['porcentajeCobertura'],
                    comentarios: tratamientos[i]['comentarios'],
                    fk_idPlan: idPlan,
                    fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral']
                })
            }

            let notificationBody = `Los siguientes tratamientos fueron agregados a tu plan: \n`

            tratamientosNotificacion.forEach(tratamiento => {
                notificationBody = notificationBody + '\n' + " - " + tratamiento
            });

            const pacientes = await Paciente.findAll({
                where: {
                    fk_idPlan: idPlan,
                    activo: true
                }
            })

            if (pacientes) {
                for (let index = 0; index < pacientes.length; index++) {

                    const usuario = pacientes[index]['dataValues']['fk_idUsuario'] ?
                        await Usuario.findByPk(pacientes[index]['dataValues']['fk_idUsuario']) : null;

                    if (usuario && usuario['dataValues']['subscription']) {

                        await Notificacion.create({
                            texto: notificationBody,
                            check: false,
                            fk_idUsuario: usuario['dataValues']['id'],
                            titulo: "Actualización de Plan"
                        })
                        sendNotification(usuario['dataValues']['subscription'], notificationBody)
                    }
                }
            }

            res.status(200).json({
                msg: "Los tratamientos se agregaron al plan correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarPlan: async (req: Request, res: Response) => {

        try {

            const { idPlan } = req.params
            const { nombre, tratamientos } = req.body

            const planNombre = await Plan.findOne({
                where: {
                    id: {
                        [Op.notIn]: [idPlan]
                    },
                    nombre: nombre,
                    activo: true
                }
            })

            if (planNombre) {
                throw new Error("El nombre de plan solicitado ya se encuentra en uso. Ingrese uno nuevo.")
            }

            const planToEdit = await Plan.findOne({
                where: {
                    id: idPlan,
                    activo: true
                }
            })

            if (!planToEdit) {
                throw new Error("No existe el plan solicitado.")
            }

            await planToEdit.update({ nombre: nombre })
            await PlanTratamientoGeneral.destroy({
                where: {
                    fk_idPlan: idPlan
                }
            })

            for (let i = 0; i < tratamientos.length; i++) {

                await PlanTratamientoGeneral.create({
                    porcentajeCobertura: tratamientos[i]['porcentajeCobertura'],
                    comentarios: tratamientos[i]['comentarios'],
                    fk_idPlan: idPlan,
                    fk_idTratamientoGeneral: tratamientos[i]['idTratamientoGeneral']
                })
            }

            res.status(200).json({
                msg: "Plan actualizado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarPlan: async (req: Request, res: Response) => {

        try {

            const { idPlan } = req.params

            const planToDelete = await Plan.findOne({
                where: {
                    id: idPlan,
                    activo: true
                }
            })

            if (!planToDelete) {
                throw new Error("No existe el plan solicitado.")
            }

            await planToDelete.update({ activo: false })

            res.status(200).json({
                msg: "Plan eliminado con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}

export default obrasSocialesController;