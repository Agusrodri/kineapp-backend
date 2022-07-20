import { DataTypes } from "sequelize";
import db from "../../database/connection";


const RolInterno = db.define('RolInterno', {

    nombreRol: {
        type: DataTypes.STRING
    },

    descripcionRol: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    }
})

export default RolInterno;