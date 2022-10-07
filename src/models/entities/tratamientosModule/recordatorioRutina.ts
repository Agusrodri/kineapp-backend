import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const RecordatorioRutina = db.define('RecordatorioRutina', {

    horario: {
        type: DataTypes.STRING
    },

    fk_idRutina: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    repeticion: {
        type: DataTypes.INTEGER
    }
})

export default RecordatorioRutina;