import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Usuario = db.define('Usuario', {

    password: {
        type: DataTypes.STRING
    },

    email: {
        type: DataTypes.STRING
    },

    telefono: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    habilitado: {
        type: DataTypes.BOOLEAN
    },

    token: {
        type: DataTypes.STRING
    },

    rolActivo: {
        type: DataTypes.INTEGER
    },

    rolInternoActivo: {
        type: DataTypes.INTEGER
    },

    personaJuridica: {
        type: DataTypes.INTEGER
    },

    tokenPassReset: {
        type: DataTypes.STRING
    }
})

export default Usuario;