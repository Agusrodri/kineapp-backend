import { NextFunction, Request, Response } from 'express';
import jwt from "jsonwebtoken";
import Usuario from '../models/entities/usersModule/usuario';
require("dotenv").config();

const validarJWT = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.header('token');

    if (!token) {
        return res.status(401).json({
            msg: 'No hay token en la petición'
        });
    }

    try {

        jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        // leer el usuario que corresponde al token
        const existsUsuarioWithToken = await Usuario.findOne({
            where: {
                token: token
            }
        })

        if (!existsUsuarioWithToken) {
            return res.status(401).json({
                msg: 'Token no válido - usuario no existe en DB'
            })
        }

        next();

    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: 'Token no válido'
        })
    }

}

export default validarJWT;