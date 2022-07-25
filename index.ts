
import Server from "./src/models/server";

if (!process.env.PORT) {
    require("dotenv").config();
}

globalThis.__basedir = __dirname


const server = new Server();


server.listen();


