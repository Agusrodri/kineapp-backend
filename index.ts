
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

//setInterval(verifyAlarmas, 10000);

const hours = {
    "1": "01" || "13",
    "2": "02" || "14",
    "3": "03" || "15",
    "4": "04" || "16",
    "5": "05" || "17",
    "6": "06" || "18",
    "7": "07" || "19",
    "8": "08" || "20",
    "9": "09" || "21",
    "10": "10" || "22",
    "11": "11" || "23",
    "12": "12" || "00"
}

console.log(hours[`"1"`] == "01")


