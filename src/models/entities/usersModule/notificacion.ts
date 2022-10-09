import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Notificacion = db.define('Notificacione', {

    texto: {
        type: DataTypes.STRING
    },

    check: {
        type: DataTypes.STRING
    },

    fk_idUsuario: {
        type: DataTypes.INTEGER
    },

    titulo: {
        type: DataTypes.STRING
    }
})

export default Notificacion;