import { NextFunction, Request, Response } from 'express';
import Notificacion from '../../models/entities/usersModule/notificacion';
import Usuario from '../../models/entities/usersModule/usuario';
const notificationsController = {

    setSubscription: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params;
            const subscription = req.body;
            const usuario = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true,
                    habilitado: true
                }
            })

            if (!usuario) {
                throw new Error("No existe el usuario solicitado.")
            }

            await usuario.update({ subscription: JSON.stringify(subscription) })

            res.status(200).json({
                msg: "Subscripción actualizada con éxito."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getNotificaciones: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params;
            const notificaciones = await Notificacion.findAll({
                where: {
                    fk_idUsuario: idUsuario
                }
            })

            res.status(200).json(notificaciones)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getNotificacionById: async (req: Request, res: Response) => {

        try {

            const { idNotificacion } = req.params;
            const notificacionToFind = await Notificacion.findOne({
                where: {
                    id: idNotificacion
                }
            })

            if (!notificacionToFind) {
                return res.status(200).json([])
            }

            await notificacionToFind.update({ check: true })
            res.status(200).json(notificacionToFind)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default notificationsController;