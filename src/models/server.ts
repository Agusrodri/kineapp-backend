import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
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
        this.middlewares();

        // Rutas de la aplicación
        this.routes();

        this.dbConnection();

        this.errors();
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
        this.app.use(cors());

        // Lectura y parseo del body
        this.app.use(express.json());

    }

    routes() {


        this.app.use(this.apiPaths.usuarios, require('../router/usersModule/rolesRoute'));
        this.app.use(this.apiPaths.usuarios, require('../router/usersModule/rolesInternosRoute'));

        //autorizar frontend para evitar error de CORS
        this.app.use((req: Request, res: Response, next: NextFunction) => {
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
            res.setHeader("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,PATCH,HEAD,OPTIONS");
        })

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