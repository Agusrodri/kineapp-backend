import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const ConvenioTratamientoGeneral = db.define('ConvenioTratamientoGenerale', {

    monto: {
        type: DataTypes.FLOAT
    },

    fk_idTratamientoGeneral: {
        type: DataTypes.INTEGER
    },

    fk_idConvenio: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

})

export default ConvenioTratamientoGeneral;