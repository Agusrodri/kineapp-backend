import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const PermisoInterno = db.define('PermisoInterno', {

    nombrePermiso: {
        type: DataTypes.STRING
    },

    icon: {
        type: DataTypes.STRING
    },

    nombreMenu: {
        type: DataTypes.STRING
    },

    rutaFront: {
        type: DataTypes.STRING
    },

    requiereIdInst: {
        type: DataTypes.BOOLEAN
    },

    requiereIdPac: {
        type: DataTypes.BOOLEAN
    },

    isMenu: {
        type: DataTypes.BOOLEAN
    }

})

export default PermisoInterno;