import { DataTypes } from "sequelize";
import db from "../../database/connection";


const Rol = db.define('Role', {

    nombreRol: {
        type: DataTypes.STRING
    },

    descripcionRol: {
        type: DataTypes.STRING
    }
})

export default Rol;