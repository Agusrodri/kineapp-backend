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
    },

    habilitado: {
        type: DataTypes.BOOLEAN
    }
})

export default RecordatorioRutina;