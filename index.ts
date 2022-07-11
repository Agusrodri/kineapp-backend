
import Server from "./src/models/server";

if (!process.env.PORT) {
    require("dotenv").config();
}


const server = new Server();


server.listen();


