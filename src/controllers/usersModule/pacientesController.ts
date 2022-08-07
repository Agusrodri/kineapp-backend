import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import Usuario from '../../models/entities/usersModule/usuario';
import sendEmail from '../../helpers/send-email';
import Paciente from '../../models/entities/usersModule/paciente';
import UsuarioRol from '../../models/entities/usersModule/usuarioRol';

const pacientesController = {

    createUsuario: async (req: Request, res: Response) => {

        try {

            const { email, password, link } = req.body

            const usuarioToFind = await Usuario.findOne({
                where: {
                    email: email,
                    activo: true
                }
            })

            if (usuarioToFind) {
                throw new Error("El correo electrónico ya está en uso.")
            }

            const salt = bcrypt.genSaltSync(12);
            const newEncriptedPassword = bcrypt.hashSync(password, salt);

            const nuevoUsuario = await Usuario.create({
                email: email,
                password: newEncriptedPassword,
                activo: true,
                habilitado: false
            })

            const idNuevoUsuario = nuevoUsuario['dataValues']['id']

            const nuevoLink = `${link}/${idNuevoUsuario}`

            await sendEmail(nuevoLink, email)

            res.status(200).json({
                msg: `Usuario creado correctamente. Se envió un correo electrónico a la dirección ${email} para verificación.`
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    createPaciente: async (req: Request, res: Response) => {

        try {

            const { idUsuario } = req.params

            const usuarioHabilitar = await Usuario.findOne({
                where: {
                    id: idUsuario,
                    activo: true
                }
            })

            if (!usuarioHabilitar) {
                throw new Error("No existe el usuario indicado.")
            }

            const { nombre,
                apellido,
                dni,
                idTipoDNI,
                fechaNacimiento,
                telefono,
                idObraSocial,
                idPlan } = req.body

            await Paciente.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                fk_idTipoDNI: idTipoDNI,
                fechaNacimiento: fechaNacimiento,
                fk_idUsuario: idUsuario,
                fk_idObraSocial: idObraSocial,
                fk_idPlan: idPlan,
                activo: true
            })

            await usuarioHabilitar.update({ habilitado: true, telefono: telefono })

            await UsuarioRol.create({
                fk_idUsuario: idUsuario,
                fk_idRol: 74 //id del rol Persona Fisica Paciente
            })

            res.status(200).json({
                msg: "Paciente creado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default pacientesController;