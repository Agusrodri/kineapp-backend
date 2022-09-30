import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const ComentarioPaciente = db.define('ComentarioPaciente', {

    puntuacion: {
        type: DataTypes.INTEGER
    },

    comentario: {
        type: DataTypes.STRING
    },

    fk_idPaciente: {
        type: DataTypes.INTEGER
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    fecha: {
        type: DataTypes.STRING
    },

    paciente: {
        type: DataTypes.STRING
    }
})

export default ComentarioPaciente;