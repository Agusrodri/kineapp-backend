import { Sequelize } from "sequelize";

const db = new Sequelize('heroku_fe8c7e5eb423ca6', 'ba4faf146889f3', '71ce21dc', {
    host: 'us-cdbr-east-06.cleardb.net',
    dialect: 'mysql'
});

export default db

//user: ba4faf146889f3
//password: 71ce21dc
//host: us-cdbr-east-06.cleardb.net
//bd_name: heroku_fe8c7e5eb423ca6
