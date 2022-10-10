import Notificacion from "../models/entities/usersModule/notificacion";
import Usuario from "../models/entities/usersModule/usuario";
import PersonaJuridica from "../models/entities/usersModule/personaJuridica";
import sendNotification from "./sendNotification";


export default async () => {

    try {
        const dateNow = new Date().toLocaleString();
        const dateNowDay = dateNow.split(" ")[0].split("/")[1]

        if (dateNowDay == "1") {
            const institucionesToNotificate = await PersonaJuridica.findAll({
                where: {
                    activo: true,
                    habilitado: true
                }
            })

            for (let index = 0; index < institucionesToNotificate.length; index++) {

                const usuario = await Usuario.findByPk(institucionesToNotificate[index]['dataValues']['fk_idUsuarios']);
                const notificationBody = "Te recordamos que modifiques la lista de convenios en caso de que haya alguno de ellos que hayas cambiado en el transcurso del mes pasado.";
                const idInstitucion = institucionesToNotificate[index]['dataValues']['id']
                if (usuario) {

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuario['dataValues']['id'],
                        titulo: "Posibles modificaciones de convenios",
                        router: `app/convenios/${idInstitucion}`
                    })

                    sendNotification(usuario['dataValues']['subscription'], notificationBody)
                }
            }
        }
    } catch (error) {
        console.log(error)
    }


}