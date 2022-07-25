import { DataTypes } from "sequelize";
import db from "../../database/connection";


const File = db.define('File', {

    nombre: {
        type: DataTypes.STRING
    },

    data: {
        type: DataTypes.BLOB("long")
    }

})

export default File;