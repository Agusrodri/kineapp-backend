import Rutina from "../models/entities/tratamientosModule/rutina";
import RecordatorioRutina from "../models/entities/tratamientosModule/recordatorioRutina";
import TratamientoPaciente from "../models/entities/tratamientosModule/tratamientoPaciente";
import Paciente from "../models/entities/usersModule/paciente";
import Usuario from "../models/entities/usersModule/usuario";
import sendNotification from "./sendNotification";
import Notificacion from "../models/entities/usersModule/notificacion";

const hours = {
    "13": "1",
    "14": "2",
    "15": "3",
    "16": "4",
    "17": "5",
    "18": "6",
    "19": "7",
    "20": "8",
    "21": "9",
    "22": "10",
    "23": "11",
    "00": "12"
}
export default async () => {
    console.log("Verifying alarmas...");
    try {
        const recordatorios = await RecordatorioRutina.findAll();
        if (recordatorios) {
            const dateNow = new Date().toLocaleString();
            console.log("----------------------------------------")
            console.log("DATE NOW: ", dateNow)
            console.log("----------------------------------------")
            const dateNowDay = dateNow.split(" ")[0]
            const dateNowHours = dateNow.split(" ")[1]
            for (let i = 0; i < recordatorios.length; i++) {

                const dateRecordatorio = recordatorios[i]['dataValues']['horario'];
                const dateRecordatorioDay = dateRecordatorio.split(" ")[0];
                const dateRecordatorioHours = dateRecordatorio.split(" ")[1];

                if (dateRecordatorioDay != dateNowDay) {
                    await recordatorios[i].update({ habilitado: true, horario: `${dateNowDay} ${dateRecordatorioHours}` });
                }
                if (!recordatorios[i]['dataValues']['habilitado'] || !recordatorios[i]['dataValues']['activo']) { continue }

                if ((hours[`${dateRecordatorioHours.split(":")[0]}`] == dateNowHours.split(":")[0]) &&
                    dateRecordatorioHours.split(":")[1] == dateNowHours.split(":")[1]) {

                    console.log("Horario alcanzado!!!!!!!");

                    const rutinaToFind = recordatorios[i]['dataValues']['fk_idRutina'] ?
                        await Rutina.findByPk(recordatorios[i]['dataValues']['fk_idRutina']) : null

                    const tratamientoPacienteToFind = rutinaToFind ?
                        await TratamientoPaciente.findByPk(rutinaToFind['dataValues']['fk_idTratamientoPaciente']) : null

                    const pacienteToFind = tratamientoPacienteToFind ?
                        await Paciente.findByPk(tratamientoPacienteToFind['dataValues']['fk_idPaciente']) : null

                    const usuarioToFind = pacienteToFind ?
                        await Usuario.findByPk(pacienteToFind['dataValues']['fk_idUsuario']) : null

                    const notificationBody = `Hora de realizar la repetición número ${recordatorios[i]['dataValues']['repeticion']} de tu rutina!`;

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuarioToFind['dataValues']['id']
                    })

                    if (usuarioToFind) { sendNotification(usuarioToFind['dataValues']['subscription'], notificationBody) }

                    await recordatorios[i].update({ habilitado: false })
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}