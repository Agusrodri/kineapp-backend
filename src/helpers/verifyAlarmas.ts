import RecordatorioRutina from "../models/entities/tratamientosModule/recordatorioRutina";

export default async () => {
    console.log("Verifying alarmas...");
    try {
        const recordatorios = await RecordatorioRutina.findAll();
        if (recordatorios) {
            const dateNow = new Date().toLocaleString()
            console.log("DATE NOW: ", dateNow)
            const dateNowDay = dateNow.split(" ")[0]
            const dateNowHours = dateNow.split(" ")[1]
            for (let i = 0; i < recordatorios.length; i++) {

                const dateRecordatorio = recordatorios[i]['dataValues']['horario'];
                const dateRecordatorioDay = dateRecordatorio.split(" ")[0];
                const dateRecordatorioHours = dateRecordatorio.split(" ")[1];

                if (!recordatorios[i]['dataValues']['activo']) { continue }
                if (dateRecordatorioDay != dateNowDay) { continue }

                if (dateRecordatorioHours.split(":")[0] == dateNowHours.split(":")[0] &&
                    dateRecordatorioHours.split(":")[1] == dateNowHours.split(":")[1]) {
                    //enviar notificación
                    console.log("Horario alcanzado!!!!!!!");
                    await recordatorios[i].update({ activo: false })
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}