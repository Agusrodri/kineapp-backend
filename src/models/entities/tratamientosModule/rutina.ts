import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const Rutina = db.define('Rutina', {

    orden: {
        type: DataTypes.INTEGER
    },

    fk_idTratamientoPaciente: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    },
})

export default Rutina;