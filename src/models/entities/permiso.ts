import { DataTypes } from "sequelize";
import db from "../../database/connection";


const Permiso = db.define('Permiso', {

    nombrePermiso: {
        type: DataTypes.STRING
    },

    icon: {
        type: DataTypes.STRING
    },

    nombreMenu: {
        type: DataTypes.STRING
    },

})

export default Permiso;