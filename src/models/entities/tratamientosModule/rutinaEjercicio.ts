import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const RutinaEjercicio = db.define('RutinaEjercicio', {

    duracion: {
        type: DataTypes.STRING
    },

    cantidadRepeticiones: {
        type: DataTypes.INTEGER
    },

    contadorCheck: {
        type: DataTypes.INTEGER
    },

    fk_idRutina: {
        type: DataTypes.INTEGER
    },

    fk_idEjercicio: {
        type: DataTypes.INTEGER
    }
})

export default RutinaEjercicio;