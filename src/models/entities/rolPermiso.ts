import { DataTypes } from "sequelize";
import db from "../../database/connection";


const RolPermiso = db.define('RolPermiso', {

    habilitadoPermiso: {
        type: DataTypes.BOOLEAN
    },

    fk_idRol: {
        type: DataTypes.INTEGER
    },

    fk_idPermiso: {
        type: DataTypes.INTEGER
    }

})

export default RolPermiso;