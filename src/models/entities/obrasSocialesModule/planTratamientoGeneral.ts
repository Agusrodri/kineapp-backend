import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const PlanTratamientoGeneral = db.define('PlanTratamientoGenerale', {

    porcentajeCobertura: {
        type: DataTypes.FLOAT
    },

    fk_idPlan: {
        type: DataTypes.INTEGER
    },

    fk_idTratamientoGeneral: {
        type: DataTypes.INTEGER
    },

    comentarios: {
        type: DataTypes.STRING
    }
})

export default PlanTratamientoGeneral;