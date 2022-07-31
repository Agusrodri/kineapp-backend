import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const PersonaJuridicaProfesional = db.define('PersonaJuridicaProfesionale', {

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    fk_idProfesional: {
        type: DataTypes.INTEGER
    },

    fk_idRolInterno: {
        type: DataTypes.INTEGER
    }
})

export default PersonaJuridicaProfesional;