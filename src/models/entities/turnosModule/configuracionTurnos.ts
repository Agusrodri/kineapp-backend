import { DataTypes } from "sequelize";
import db from "../../../database/connection";

const ConfiguracionTurnos = db.define('ConfiguracionTurno', {

    diasAtencion: {
        type: DataTypes.STRING
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    horaInicioAtencion: {
        type: DataTypes.STRING
    },

    horaFinAtencion: {
        type: DataTypes.STRING
    },

    pacientesSimultaneos: {
        type: DataTypes.INTEGER
    }
})

export default ConfiguracionTurnos;