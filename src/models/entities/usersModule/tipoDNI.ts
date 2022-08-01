import { DataTypes } from "sequelize";
import db from "../../../database/connection";


const TipoDNI = db.define('TipoDNI', {

    tipoDNI: {
        type: DataTypes.STRING
    }

})

export default TipoDNI;