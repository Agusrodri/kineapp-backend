import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const PjTratamientoGeneral = db.define('PjTratamientoGenerale', {

    fk_idTratamientoGeneral: {
        type: DataTypes.INTEGER
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    }

})

export default PjTratamientoGeneral;