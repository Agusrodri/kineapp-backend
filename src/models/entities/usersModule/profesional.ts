import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const Profesional = db.define('Profesionale', {

    nombre: {
        type: DataTypes.STRING
    },

    apellido: {
        type: DataTypes.STRING
    },

    dni: {
        type: DataTypes.STRING
    },

    tipoDNI: {
        type: DataTypes.STRING
    },

    fechaNacimiento: {
        type: DataTypes.DATE
    },

    numeroMatricula: {
        type: DataTypes.STRING
    },

    nivelEducativo: {
        type: DataTypes.STRING
    },

    activo: {
        type: DataTypes.BOOLEAN
    },

    fk_idUsuario: {
        type: DataTypes.INTEGER
    }

})

export default Profesional;