import { Sequelize } from "sequelize";

const db = new Sequelize('heroku_fe8c7e5eb423ca6', 'ba4faf146889f3', '71ce21dc', {
    host: 'us-cdbr-east-06.cleardb.net',
    dialect: 'mysql',
    pool: {
        max: 15,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

export default db

//user: ba4faf146889f3
//password: 71ce21dc
//host: us-cdbr-east-06.cleardb.net
//bd_name: heroku_fe8c7e5eb423ca6
