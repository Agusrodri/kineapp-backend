import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const Turno = db.define('Turno', {

    horario: {
        type: DataTypes.STRING
    },

    fk_idPaciente: {
        type: DataTypes.INTEGER
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    fk_idTratamiento: {
        type: DataTypes.INTEGER
    },

    monto: {
        type: DataTypes.FLOAT
    },

    estado: {
        type: DataTypes.STRING
    },

    obraSocial: {
        type: DataTypes.STRING
    },

    plan: {
        type: DataTypes.STRING
    },

    checkSemana: {
        type: DataTypes.BOOLEAN
    },

    checkTresDias: {
        type: DataTypes.BOOLEAN
    },

    checkDosDias: {
        type: DataTypes.BOOLEAN
    }
})

export default Turno;