import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const ObraSocial = db.define('ObraSociale', {

    nombre: {
        type: DataTypes.STRING
    },

    cuit: {
        type: DataTypes.STRING
    },

    razonSocial: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    domicilio: {
        type: DataTypes.STRING
    },

    telefono: {
        type: DataTypes.STRING
    },

    email: {
        type: DataTypes.STRING
    }

})

export default ObraSocial;