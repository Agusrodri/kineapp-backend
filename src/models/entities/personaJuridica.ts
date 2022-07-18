import { DataTypes } from "sequelize";
import db from "../../database/connection";


const PersonaJuridica = db.define('PersonaJuridica', {

    nombre: {
        type: DataTypes.STRING
    },

    razonSocial: {
        type: DataTypes.STRING
    },

    domicilio: {
        type: DataTypes.STRING
    },

    fk_idUsuarios: {
        type: DataTypes.INTEGER
    }

})

export default PersonaJuridica;