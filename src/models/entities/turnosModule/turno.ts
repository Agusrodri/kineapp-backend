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
    }
})

export default Turno;