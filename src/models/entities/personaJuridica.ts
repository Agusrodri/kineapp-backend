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
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    cuit: {
        type: DataTypes.BOOLEAN
    }

})

export default PersonaJuridica;