import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';


const loginControllers = {

    create: async (req: Request, res: Response, next: NextFunction) => {

        try {


            //llamar al método para crear usuario en la bd

        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al registrar usuario'
            });
        }


    },

    login: async (req: Request, res: Response, next: NextFunction) => {

        try {

            // Verificar si el usuario existe

            // Si el usuario está habilitado 


            // Verificar la contraseña


            // Generar el JWT



        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al iniciar sesión'
            });
        }


    },

    logout: async (req: Request, res: Response, next: NextFunction) => {

        try {


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error al cerrar sesión'
            });


        }

    }

}

export default loginControllers