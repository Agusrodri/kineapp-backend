import Turno from "../models/entities/turnosModule/turno";
import sendNotificationTurnoPaciente from "./sendNotificationTurnoPaciente";

export default async () => {
    console.log("Verifying alarmas turno...");
    try {
        const recordatorios = await Turno.findAll();
        if (recordatorios) {

            const today = new Date();
            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + 3, today.getMinutes(), today.getSeconds());

            for (let i = 0; i < recordatorios.length; i++) {
                const dateRecordatorio = new Date(recordatorios[i]['dataValues']['horario']).getTime();
                const difDatesInHours = (((dateRecordatorio - todayUTC) / 1000) / 60) / 60

                if (Math.trunc(difDatesInHours) == 168 && !recordatorios[i]['dataValues']['checkSemana']) {

                    const notificationBody = "Te recordamos que tienes un turno dentro de una semana.";
                    const notificationTitle = "Recordatorio de turno";
                    const route = "";
                    const notification = sendNotificationTurnoPaciente(recordatorios[i]['dataValues']['fk_idPaciente'], notificationBody, notificationTitle, route);
                    notification ? await recordatorios[i].update({ checkSemana: true }) : false;
                }

                if (Math.trunc(difDatesInHours) == 72 && !recordatorios[i]['dataValues']['checkTresDias']) {

                    const notificationBody = "Te recordamos que tienes un turno dentro de tres días.";
                    const notificationTitle = "Recordatorio de turno";
                    const route = "";
                    const notification = sendNotificationTurnoPaciente(recordatorios[i]['dataValues']['fk_idPaciente'], notificationBody, notificationTitle, route);
                    notification ? await recordatorios[i].update({ checkTresDias: true }) : false;
                }

                if (Math.trunc(difDatesInHours) == 48 && !recordatorios[i]['dataValues']['checkDosDias']) {

                    const notificationBody = `Tienes un turno en dos días y es necesario que confirmes la asistencia al mismo presionando la opción “Confirmar”.`;
                    const notificationTitle = "Confirmación de turno";
                    const route = "";
                    const notification = sendNotificationTurnoPaciente(recordatorios[i]['dataValues']['fk_idPaciente'], notificationBody, notificationTitle, route);
                    notification ? await recordatorios[i].update({ checkDosDias: true }) : false;
                }
            }
        }
    } catch (error) {
        console.log(error);
    }
}