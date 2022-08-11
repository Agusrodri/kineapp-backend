import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const TratamientoGeneral = db.define('TratamientoGenerale', {

    nombre: {
        type: DataTypes.STRING
    },

    descripcion: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    }
})

export default TratamientoGeneral;