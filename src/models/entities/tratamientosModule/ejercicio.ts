import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const Ejercicio = db.define('Ejercicio', {

    nombre: {
        type: DataTypes.STRING
    },

    complejidad: {
        type: DataTypes.STRING
    },

    descripcion: {
        type: DataTypes.STRING
    },

    gif: {
        type: DataTypes.STRING
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    },
})

export default Ejercicio;