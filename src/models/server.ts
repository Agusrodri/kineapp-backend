import express, { Application } from "express";
//import cors from "cors";
import db from "../database/connection";


class Server {

    private app: Application;
    private port: string;
    private apiPaths = {
        usuarios: '/api/usuarios'

    }

    constructor() {
        this.app = express();
        this.port = process.env.PORT || "8002";



        // Middlewares
        // this.middlewares();

        // Rutas de mi aplicación
        this.routes();

        this.dbConnection();

        //this.errors();
    }

    async dbConnection() {

        try {

            await db.authenticate()
            console.log("Database online!!")

        } catch (error: any) {
            throw new Error(error)

        }

    }


    middlewares() {

        // CORS
        //this.app.use(cors());

        // Lectura y parseo del body
        //this.app.use(express.json());


    }

    routes() {

        //this.app.use(this.authPath, require('../routes/auth'));
        this.app.use(this.apiPaths.usuarios, require('../router/usersModule/rolesRoute'));

    }

    listen() {

        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }

    errors() {
        this.app.all("*", (req: express.Request) => {
            throw new Error("Error");
        });
    }

}




export default Server;