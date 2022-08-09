import jwt from "jsonwebtoken";

const generarToken = {
    generarJWT: (finalToken: string) => {

        return new Promise((resolve, reject) => {

            const payload = { finalToken };

            jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
                expiresIn: '30s'
            }, (err, token) => {

                if (err) {
                    console.log(err);
                    reject('No se pudo generar el token')
                } else {
                    resolve(token);
                }
            })
        })
    }
}
export default generarToken
