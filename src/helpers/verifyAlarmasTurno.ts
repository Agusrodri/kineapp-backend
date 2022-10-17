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
            const dateRecordatorio = new Date("10/16/2022 16:30:00").getTime();
            console.log("RECORDATORIO UTC ", dateRecordatorio)
            console.log("DIFERENCIA FECHAS: ", todayUTC - dateRecordatorio)
            for (let i = 0; i < recordatorios.length; i++) {




            }
        }
    } catch (error) {
        console.log(error)
    }
}