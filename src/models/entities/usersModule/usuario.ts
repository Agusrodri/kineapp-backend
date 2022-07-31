import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Usuario = db.define('Usuario', {

    password: {
        type: DataTypes.STRING
    },

    email: {
        type: DataTypes.STRING
    },

    telefono: {
        type: DataTypes.STRING
    }

})

export default Usuario;