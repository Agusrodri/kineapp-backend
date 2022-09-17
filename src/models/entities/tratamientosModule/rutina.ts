import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const Rutina = db.define('Rutina', {

    fk_idTratamientoPaciente: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    finalizada: {
        type: DataTypes.BOOLEAN
    },

    fechaFinalizacion: {
        type: DataTypes.DATE
    },

    fk_idProfesional: {
        type: DataTypes.INTEGER
    }
})

export default Rutina;