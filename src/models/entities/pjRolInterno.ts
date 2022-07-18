import { DataTypes } from "sequelize";
import db from "../../database/connection";


const PjRolInterno = db.define('PjRolInterno', {

    fk_idPersonaJuridica: {
        type: DataTypes.INTEGER
    },

    fk_idRolInterno: {
        type: DataTypes.INTEGER
    }

})

export default PjRolInterno;