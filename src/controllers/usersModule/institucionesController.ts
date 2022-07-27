import { NextFunction, Request, Response } from "express"
import fs from 'fs'
import Usuario from "../../models/entities/usuario";
import PersonaJuridica from "../../models/entities/personaJuridica";
import UsuarioRol from "../../models/entities/usuarioRol";
import Rol from "../../models/entities/rol";

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

            //buscar la institucion con el id

            const institucion = await PersonaJuridica.findOne({
                where: {
                    id: idPersonaJuridica,
                    activo: true
                }
            })

            //obtener los datos de la institucion que necesitamos enviar al front

            const { nombre, razonSocial, domicilio, fk_idUsuarios, cuit } = institucion['dataValues']

            //buscar al usuario asociado a esa persona jurídica

            const usuarioInstitucion = await Usuario.findByPk(fk_idUsuarios)

            //obtener los datos del usuario que necesitamos enviar al front

            const { email, telefono } = usuarioInstitucion['dataValues']

            //obtener el rol de ese usuario asociado a la persona juridica

            const usuarioRol = await UsuarioRol.findOne({
                where: {
                    fk_idUsuario: fk_idUsuarios,
                    fk_idPersonaJuridica: idPersonaJuridica
                }
            })

            const idRolUsuario = usuarioRol['dataValues']['fk_idRol']

            const rol = await Rol.findByPk(idRolUsuario)

            //obtener los datos del rol a enviar al front

            const nombreRol = rol['dataValues']['nombreRol']

            //response final

            const responseJson = {
                nombre: nombre,
                cuit: cuit,
                razonSocial: razonSocial,
                email: email,
                domicilio: domicilio,
                telefono: telefono,
                nombreRol: nombreRol
            }

            res.status(200).json(responseJson)


        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });

        }

    },

    /* uploadFile: async (req: Request, res: Response) => {

        try {

            console.log(req.file);

            if (req.file == undefined) {
                throw new Error("Debe seleccionar un archivo.")
            }

            const file = await File.create({
                nombre: req.file.originalname,
                data: fs.readFileSync(
                    __dirname + "/public/files/uploads" + req.file.filename
                )
            })

            fs.writeFileSync(
                __dirname + "/public/files/tmp/" + file['dataValues']['nombre'], file['dataValues']['data']
            )

            res.status(200).json({
                msg: "Archivo subido con éxito."
            })


        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }

    } */

}

export default institucionesController;