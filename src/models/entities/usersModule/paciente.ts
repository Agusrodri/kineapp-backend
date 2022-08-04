import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Paciente = db.define('Paciente', {

    nombre: {
        type: DataTypes.STRING
    },

    apellido: {
        type: DataTypes.STRING
    },

    dni: {
        type: DataTypes.STRING
    },

    fechaNacimiento: {
        type: DataTypes.DATE
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    fk_idUsuario: {
        type: DataTypes.INTEGER
    },

    fk_idTipoDNI: {
        type: DataTypes.INTEGER
    },

    fk_idObraSocial: {
        type: DataTypes.INTEGER
    },

    fk_idPlan: {
        type: DataTypes.INTEGER
    }

})

export default Paciente;