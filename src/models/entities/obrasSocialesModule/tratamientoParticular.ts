import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const TratamientoParticular = db.define('TratamientoParticulare', {

    nombre: {
        type: DataTypes.STRING
    },

    monto: {
        type: DataTypes.FLOAT
    },

    descripcion: {
        type: DataTypes.STRING
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    }
})

export default TratamientoParticular;