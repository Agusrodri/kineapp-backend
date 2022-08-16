import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Convenio = db.define('Convenio', {

    nombre: {
        type: DataTypes.STRING
    },

    descripcion: {
        type: DataTypes.STRING
    },

    fk_idObraSocial: {
        type: DataTypes.INTEGER
    },

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    activo: {
        type: DataTypes.BOOLEAN
    }

})

export default Convenio;