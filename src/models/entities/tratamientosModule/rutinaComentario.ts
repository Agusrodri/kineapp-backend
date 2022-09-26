import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const RutinaComentario = db.define('RutinaComentario', {

    comentario: {
        type: DataTypes.STRING
    },

    isComentarioPaciente: {
        type: DataTypes.BOOLEAN
    },

    fecha: {
        type: DataTypes.STRING
    },

    fk_idRutina: {
        type: DataTypes.INTEGER
    }
})

export default RutinaComentario;