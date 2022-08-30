import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const TratamientoPaciente = db.define('TratamientoPaciente', {

    fechaInicio: {
        type: DataTypes.DATE
    },

    fechaFin: {
        type: DataTypes.DATE
    },

    fk_idPaciente: {
        type: DataTypes.INTEGER
    },

    fk_idTratamiento: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    }

})

export default TratamientoPaciente;