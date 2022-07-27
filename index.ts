
import Server from "./src/models/server";

if (!process.env.PORT) {
    require("dotenv").config();
}

globalThis.__basedir = __dirname
globalThis.__baseurl = "http://api-kineapp.herokuapp.com/api/"

//globalThis.__baseurl = "http://localhost:8003/api/"

const server = new Server();


server.listen();


