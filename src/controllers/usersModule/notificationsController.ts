import { NextFunction, Request, Response } from 'express';
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
    }

}

export default notificationsController;