import Paciente from "../models/entities/usersModule/paciente";
import Turno from "../models/entities/turnosModule/turno";


const hours = {
    "1": ["01", "13"],
    "2": ["02", "14"],
    "3": ["03", "15"],
    "4": ["04", "16"],
    "5": ["05", "17"],
    "6": ["06", "18"],
    "7": ["07", "19"],
    "8": ["08", "20"],
    "9": ["09", "21"],
    "10": ["10", "22"],
    "11": ["11", "23"],
    "12": ["12", "00"]
}
export default async () => {
    console.log("Verifying alarmas turno...");
    try {
        const recordatorios = await Turno.findAll();
        if (recordatorios) {


            const today = new Date();
            const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + 3, today.getMinutes(), today.getSeconds());
            console.log("TODAY UTC ", todayUTC)

            for (let i = 0; i < recordatorios.length; i++) {

                const dateRecordatorio = new Date(recordatorios[i]['dataValues']['horario']).getTime();
                const difDatesInHours = (((todayUTC - dateRecordatorio) / 1000) / 60) / 60
                console.log("RECORDATORIO UTC ", dateRecordatorio)
                console.log("DIFERENCIA FECHAS: ",)

                if (Math.trunc(difDatesInHours) == 168) {
                    const paciente = await Paciente.findOne({
                        where: {
                            id: recordatorios[i]['dataValues']['fk_idPaciente'],
                            activo: true
                        }
                    })

                    if (!paciente) { continue }

                }

            }
        }
    } catch (error) {
        console.log(error)
    }
}