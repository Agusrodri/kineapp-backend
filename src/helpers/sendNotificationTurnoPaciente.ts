import Usuario from "../models/entities/usersModule/usuario";
import Paciente from "../models/entities/usersModule/paciente";
import Notificacion from "../models/entities/usersModule/notificacion";
import sendNotification from "./sendNotification";

export default async (fk_idPaciente: number, notificationBody: string, notificationTitle: string, route: string) => {

    try {

        const paciente = await Paciente.findOne({
            where: {
                id: fk_idPaciente,
                activo: true
            }
        })

        if (!paciente) { return false }

        const usuarioToFind = paciente['dataValues']['fk_idUsuario'] ?
            await Usuario.findByPk(paciente['dataValues']['fk_idUsuario']) : null;

        if (usuarioToFind) {

            await Notificacion.create({
                texto: notificationBody,
                check: false,
                fk_idUsuario: usuarioToFind['dataValues']['id'],
                titulo: notificationTitle,
                router: route
            })

            sendNotification(usuarioToFind['dataValues']['subscription'], notificationBody);
            return true;
        }
        return false;
    } catch (error) {
        console.log(error);
    }


}