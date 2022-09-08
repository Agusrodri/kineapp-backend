import express, { Application, NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import routes from "../router/indexRoute";
import db from "../database/connection";

class Server {

    private app: Application;
    private port: string;
    private apiPaths = {
        usuarios: '/api/usuarios'
    }

    constructor() {
        // Inicializar el servidor express
        this.app = express();

        // Definir el puerto a utilizar
        this.port = process.env.PORT || "8002";

        // Middlewares
        this.middlewares();

        // Rutas de la aplicación
        this.routes();

        // Conexión con la db
        this.dbConnection();

        // Tratamiento de errores
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

        this.app.use(
            bodyParser.urlencoded({
                extended: true,
            })
        );

        //servir archivos públicos
        this.app.use(express.static(globalThis.__basedir + "/resources/static/assets/files/public"))
        //console.log("DIRNAME ", __dirname)
    }

    routes() {

        /*   this.app.use(this.apiPaths.usuarios, require('../router/usersModule/rolesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/usersModule/rolesInternosRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/usersModule/institucionesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/usersModule/profesionalesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/usersModule/pacientesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/usersModule/loginRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/obrasSocialesModule/obrasSocialesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/obrasSocialesModule/tratamientosGeneralesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/obrasSocialesModule/conveniosRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/obrasSocialesModule/tratamientosParticularesRoute'));
          this.app.use(this.apiPaths.usuarios, require('../router/filesRoute/filesRoute')); */

        for (const route of routes) {
            this.app.use(this.apiPaths.usuarios, route)
        }

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