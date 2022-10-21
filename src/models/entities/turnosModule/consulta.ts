import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const Consulta = db.define('Consulta', {

    asistio: {
        type: DataTypes.BOOLEAN
    },

    observaciones: {
        type: DataTypes.STRING
    },

    fk_idTurno: {
        type: DataTypes.INTEGER
    },

    fk_idProfesional: {
        type: DataTypes.INTEGER
    },

    puntuacion: {
        type: DataTypes.INTEGER
    }
})

export default Consulta;