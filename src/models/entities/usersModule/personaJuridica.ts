import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const PersonaJuridica = db.define('PersonaJuridica', {

    nombre: {
        type: DataTypes.STRING,
        unique: true
    },

    razonSocial: {
        type: DataTypes.STRING
    },

    domicilio: {
        type: DataTypes.STRING
    },

    fk_idUsuarios: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    cuit: {
        type: DataTypes.BOOLEAN
    },

    habMinisterioSalud: {
        type: DataTypes.STRING
    },

    habMunicipal: {
        type: DataTypes.STRING
    },

    habSuperintendencia: {
        type: DataTypes.STRING
    },

    habilitado: {
        type: DataTypes.BOOLEAN
    }

})

export default PersonaJuridica;