import { Request, Response } from 'express';
import Usuario from '../../models/entities/usersModule/usuario';
import Paciente from '../../models/entities/usersModule/paciente';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';
import TipoDNI from '../../models/entities/usersModule/tipoDNI';
import ObraSocial from '../../models/entities/obrasSocialesModule/obraSocial';
import Plan from '../../models/entities/obrasSocialesModule/plan';
import { Op } from 'sequelize';

const pacientesInstitucionesController = {

    getPacientesInstitucion: async (req: Request, res: Response) => {
        try {
            const { idPersonaJuridica } = req.params
            const pjPacientes = await PersonaJuridicaPaciente.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })
            const pacientes = []
            for (let i = 0; i < pjPacientes.length; i++) {
                const paciente = await Paciente.findOne({
                    where: {
                        id: pjPacientes[i]['fk_idPaciente'],
                        activo: true
                    }
                })
                pacientes.push(paciente)
            }
            res.status(200).json(pacientes)
        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getPacienteById: async (req: Request, res: Response) => {
        try {

            const { idPersonaJuridica, idPaciente } = req.params

            //verificar que el paciente pertenezca a la institución
            const pjPacientes = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPaciente: idPaciente,
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!pjPacientes) {
                throw new Error("El paciente solicitado no existe dentro de la institución.")
            }

            //obtener paciente
            const paciente = await Paciente.findOne({
                where: {
                    id: idPaciente,
                    activo: true
                }
            })

            if (!paciente) {
                throw new Error("No existe el paciente solicitado.")
            }

            //obtener usuario asociado al paciente
            const usuarioPaciente = await Usuario.findOne({
                where: {
                    id: paciente['dataValues']['fk_idUsuario'],
                    activo: true
                }
            })

            //obtener datos restantes - email, telefono, tipoDNI, obraSocial y plan
            const { email, telefono } = usuarioPaciente['dataValues']
            const tipoDNI = await TipoDNI.findByPk(paciente['dataValues']['fk_idTipoDNI'])
            const obraSocial = await ObraSocial.findByPk(paciente['dataValues']['fk_idObraSocial'])
            const plan = await Plan.findByPk(paciente['dataValues']['fk_idPlan'])

            //response final
            const pacienteResponse = {
                idUsuario: paciente['dataValues']['fk_idUsuario'],
                nombre: paciente['dataValues']['nombre'],
                apellido: paciente['dataValues']['apellido'],
                dni: paciente['dataValues']['dni'],
                tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                idTipoDNI: paciente['dataValues']['fk_idTipoDNI'],
                fechaNacimiento: paciente['dataValues']['fechaNacimiento'],
                obraSocial: obraSocial['dataValues']['nombre'],
                idObraSocial: obraSocial['dataValues']['id'],
                plan: plan['dataValues']['nombre'],
                idPlan: plan['dataValues']['id'],
                numeroAfiliado: paciente['dataValues']['numeroAfiliado'],
                email,
                telefono
            }

            res.status(200).json(pacienteResponse)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    agregarPaciente: async (req: Request, res: Response) => {
        try {

            const { idPersonaJuridica } = req.params
            const { nombre,
                apellido,
                dni,
                idTipoDNI,
                fechaNacimiento,
                telefono,
                email,
                idObraSocial,
                idPlan,
                numeroAfiliado } = req.body

            const pacienteToFind = await Paciente.findOne({
                where: {
                    [Op.or]: {
                        dni: dni,
                        [Op.and]: {
                            numeroAfiliado: numeroAfiliado,
                            fk_idObraSocial: idObraSocial
                        }
                    },
                    activo: true
                }
            })

            if ((pacienteToFind ? pacienteToFind['dataValues']['dni'] : 0) == dni) {
                throw new Error("El DNI ingresado ya se encuentra en uso. Por favor, ingrese uno diferente.")
            } else if ((pacienteToFind ? pacienteToFind['dataValues']['numeroAfiliado'] : 0) &&
                (pacienteToFind ? pacienteToFind['dataValues']['fk_idObraSocial'] : 0) == idObraSocial) {
                throw new Error("El número de afiliado ya existe dentro de la obra social indicada. Por favor, ingrese uno diferente.")
            }

            const newPaciente = await Paciente.create({
                nombre: nombre,
                apellido: apellido,
                dni: dni,
                fk_idTipoDNI: idTipoDNI,
                fechaNacimiento: fechaNacimiento,
                telefonoPersonal: telefono,
                emailPersonal: email,
                fk_idUsuario: null,
                fk_idObraSocial: idObraSocial,
                fk_idPlan: idPlan,
                numeroAfiliado: numeroAfiliado,
                activo: true
            })

            await PersonaJuridicaPaciente.create({
                fk_idPersonaJuridica: idPersonaJuridica,
                fk_idPaciente: newPaciente['dataValues']['id'],
                activo: true
            })

            res.status(200).json({
                msg: "Paciente creado con éxito",
                newPaciente
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarPaciente: async (req: Request, res: Response) => {
        try {

            const { idPersonaJuridica, idPaciente } = req.params
            const { nombre,
                apellido,
                fechaNacimiento,
                telefono,
                email,
                idObraSocial,
                idPlan,
                numeroAfiliado } = req.body

            //verificar que el paciente pertenezca a la institución
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idPaciente: idPaciente,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente dentro de la institución.")
            }

            //verificar que el número de afiliado no esté en uso dentro de esa obra social
            const pacienteToFind = await Paciente.findOne({
                where: {
                    id: { [Op.notIn]: [idPaciente] },
                    numeroAfiliado: numeroAfiliado,
                    fk_idObraSocial: idObraSocial,
                    activo: true
                }
            })

            if (pacienteToFind) {
                throw new Error("El número de afiliado ya existe dentro de la obra social indicada. Por favor, ingrese uno diferente.")
            }

            //buscar paciente a editar
            const pacienteToEdit = await Paciente.findOne({
                where: {
                    id: idPaciente,
                    activo: true
                }
            })

            if (!pacienteToEdit) {
                throw new Error("No existe el paciente solicitado.")
            }

            //verificar si el paciente tiene usuario - si lo creó la institución, no tiene usuario
            if (pacienteToEdit['dataValues']['fk_idUsuario']) {
                const usuarioToFind = await Usuario.findOne({
                    where: {
                        id: pacienteToEdit['dataValues']['fk_idUsuario'],
                        activo: true
                    }
                })

                if (!usuarioToFind) {
                    throw new Error("No existe un usuario asociado al paciente indicado.")
                }

                //si tiene usuario, modificamos el email y teléfono en el usuario
                await usuarioToFind.update({
                    email: email,
                    telefono: telefono
                })

                await pacienteToEdit.update({
                    nombre: nombre,
                    apellido: apellido,
                    fechaNacimiento: fechaNacimiento,
                    fk_idObraSocial: idObraSocial,
                    fk_idPlan: idPlan,
                    numeroAfiliado: numeroAfiliado
                })

                res.status(200).json({
                    msg: "Paciente actualizado correctamente.",
                    pacienteEdited: pacienteToEdit,
                    usuarioEdited: usuarioToFind
                })

            } else {

                //si no tiene usuario, modificamos el email y teléfono personales (propios del paciente y no del usuario)
                await pacienteToEdit.update({
                    nombre: nombre,
                    apellido: apellido,
                    fechaNacimiento: fechaNacimiento,
                    emailPersonal: email,
                    telefonoPersonal: telefono,
                    fk_idObraSocial: idObraSocial,
                    fk_idPlan: idPlan,
                    numeroAfiliado: numeroAfiliado
                })

                res.status(200).json({
                    msg: "Paciente actualizado correctamente.",
                    pacienteEdited: pacienteToEdit
                })
            }

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarPaciente: async (req: Request, res: Response) => {
        try {

            const { idPersonaJuridica, idPaciente } = req.params

            //verificar que el paciente pertenezca a la institución
            const pjPaciente = await PersonaJuridicaPaciente.findOne({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    fk_idPaciente: idPaciente,
                    activo: true
                }
            })

            if (!pjPaciente) {
                throw new Error("No existe el paciente dentro de la institución.")
            }

            await pjPaciente.update({ activo: false })

            res.status(200).json({
                msg: "Paciente eliminado correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }


}

export default pacientesInstitucionesController;