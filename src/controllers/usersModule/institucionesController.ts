import { NextFunction, Request, Response } from "express"
import Usuario from "../../models/entities/usuario";
import PersonaJuridica from "../../models/entities/personaJuridica";
import UsuarioRol from "../../models/entities/usuarioRol";

const institucionesController = {

    getInstituciones: async (req: Request, res: Response) => {

        try {

            const instituciones = await PersonaJuridica.findAll({
                where: {
                    activo: true
                }
            })

            if (instituciones.length != 0) {

                res.status(200).json(instituciones)

            } else {
                throw new Error("No existen instituciones cargadas")

            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    getInstitucionById: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params

            const response = []

            const institucion = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            const idUsuarioInstitucion = institucion['dataValues']['fk_idUsuarios']

            const usuarioInstitucion = await Usuario.findByPk(idUsuarioInstitucion)

            const emailInstitucion = usuarioInstitucion['dataValues']['email']
            const telefonoInstitucion = usuarioInstitucion['dataValues']['telefono']

            const usuarioRol = await UsuarioRol.findAll({

                where: {
                    fk_idUsuario: idUsuarioInstitucion
                }
            })


            console.log(usuarioRol['dataValues']['fk_idRol'])



        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });

        }

    }

}

export default institucionesController;