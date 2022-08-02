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
    },

    activo: {
        type: DataTypes.BOOLEAN
    }
})

export default PersonaJuridicaProfesional;