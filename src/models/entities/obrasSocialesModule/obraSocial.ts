import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const ObraSocial = db.define('ObraSociale', {

    nombre: {
        type: DataTypes.STRING
    },

    codigo: {
        type: DataTypes.STRING
    },

    razonSocial: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    }

})

export default ObraSocial;