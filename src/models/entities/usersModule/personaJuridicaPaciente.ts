import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const PersonaJuridicaPaciente = db.define('PersonaJuridicaPaciente', {

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    fk_idPaciente: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.INTEGER
    }

})

export default PersonaJuridicaPaciente;