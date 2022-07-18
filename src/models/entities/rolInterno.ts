import { DataTypes } from "sequelize";
import db from "../../database/connection";


const RolInterno = db.define('RolInterno', {

    nombreRolInterno: {
        type: DataTypes.STRING
    },

    descripcion: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    }
})

export default RolInterno;