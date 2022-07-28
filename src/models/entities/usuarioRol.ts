import { DataTypes } from "sequelize";
import db from "../../database/connection";


const UsuarioRol = db.define('UsuarioRole', {

    fk_idUsuario: {
        type: DataTypes.INTEGER
    },

    fk_idRol: {
        type: DataTypes.INTEGER
    }
})

export default UsuarioRol;