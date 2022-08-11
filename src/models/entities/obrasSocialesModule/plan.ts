import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Plan = db.define('Plane', {

    nombre: {
        type: DataTypes.STRING
    },

    fk_idObraSocial: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    }

})

export default Plan;