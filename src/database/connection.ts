import { Sequelize } from "sequelize";

const db = new Sequelize('kineapp_db', 'root', '1234', {
    host: 'localhost',
    dialect: 'mysql'
});


export default db




