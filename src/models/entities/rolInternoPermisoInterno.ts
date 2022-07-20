import { DataTypes } from "sequelize";
import db from "../../database/connection";


const RolInternoPermisoInterno = db.define('RolInternoPermisoInterno', {

    habilitado: {
        type: DataTypes.BOOLEAN
    },

    fk_idRolInterno: {
        type: DataTypes.INTEGER
    },

    fk_idPermisoInterno: {
        type: DataTypes.INTEGER
    }

})

export default RolInternoPermisoInterno;