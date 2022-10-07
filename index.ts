
import Server from "./src/models/server";
import verifyAlarmas from "./src/helpers/verifyAlarmas";

if (!process.env.PORT) {
    require("dotenv").config();
}

globalThis.__basedir = __dirname
globalThis.__baseurl = "http://api-kineapp.herokuapp.com/api/"
globalThis.__baseurl2 = "http://api-kineapp.herokuapp.com/"

//globalThis.__baseurl = "http://localhost:8003/api/"

const server = new Server();


server.listen();

//setInterval(verifyAlarmas, 5000);


