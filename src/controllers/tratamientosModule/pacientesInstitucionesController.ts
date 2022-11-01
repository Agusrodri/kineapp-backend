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

                //obtener datos restantes - tipoDNI, obraSocial y plan
                const tipoDNI = await TipoDNI.findByPk(paciente['dataValues']['fk_idTipoDNI'])
                const obraSocial = paciente['dataValues']['fk_idObraSocial'] ? await ObraSocial.findByPk(paciente['dataValues']['fk_idObraSocial']) : null
                const plan = paciente['dataValues']['fk_idPlan'] ? await Plan.findByPk(paciente['dataValues']['fk_idPlan']) : null

                //verificar si el paciente tiene usuario asociado - si no lo tiene, es debido a que la institución lo creó
                if (paciente['dataValues']['fk_idUsuario']) {
                    //obtener usuario asociado al paciente
                    const usuarioPaciente = await Usuario.findOne({
                        where: {
                            id: paciente['dataValues']['fk_idUsuario'],
                            activo: true
                        }
                    })

                    //si el paciente tiene un usuario asociado, traer su email y telefono
                    const { email, telefono } = usuarioPaciente['dataValues']

                    //objeto a agregar al array de response
                    const pacienteResponse = {
                        id: paciente['dataValues']['id'],
                        idUsuario: paciente['dataValues']['fk_idUsuario'],
                        nombre: paciente['dataValues']['nombre'],
                        apellido: paciente['dataValues']['apellido'],
                        dni: paciente['dataValues']['dni'],
                        tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                        idTipoDNI: paciente['dataValues']['fk_idTipoDNI'],
                        fechaNacimiento: paciente['dataValues']['fechaNacimiento'],
                        obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                        idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                        plan: plan ? plan['dataValues']['nombre'] : null,
                        idPlan: plan ? plan['dataValues']['id'] : null,
                        numeroAfiliado: paciente['dataValues']['numeroAfiliado'],
                        email,
                        telefono
                    }
                    pacientes.push(pacienteResponse)
                } else {
                    //objeto a agregar al array de response
                    const pacienteResponse = {
                        msg: "Paciente sin usuario asociado - Paciente creado por la institución",
                        id: paciente['dataValues']['id'],
                        idUsuario: paciente['dataValues']['fk_idUsuario'],
                        nombre: paciente['dataValues']['nombre'],
                        apellido: paciente['dataValues']['apellido'],
                        dni: paciente['dataValues']['dni'],
                        tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                        idTipoDNI: paciente['dataValues']['fk_idTipoDNI'],
                        fechaNacimiento: paciente['dataValues']['fechaNacimiento'],
                        obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                        idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                        plan: plan ? plan['dataValues']['nombre'] : null,
                        idPlan: plan ? plan['dataValues']['id'] : null,
                        numeroAfiliado: paciente['dataValues']['numeroAfiliado'],
                        email: paciente['dataValues']['emailPersonal'],
                        telefono: paciente['dataValues']['telefonoPersonal']
                    }

                    pacientes.push(pacienteResponse)
                }
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

            //obtener datos restantes - tipoDNI, obraSocial y plan
            const tipoDNI = await TipoDNI.findByPk(paciente['dataValues']['fk_idTipoDNI'])
            const obraSocial = paciente['dataValues']['fk_idObraSocial'] ? await ObraSocial.findByPk(paciente['dataValues']['fk_idObraSocial']) : null
            const plan = paciente['dataValues']['fk_idPlan'] ? await Plan.findByPk(paciente['dataValues']['fk_idPlan']) : null

            //verificar si el paciente tiene usuario asociado - si no lo tiene, es debido a que la institución lo creó
            if (paciente['dataValues']['fk_idUsuario'] ? paciente['dataValues']['fk_idUsuario'] : null) {
                //obtener usuario asociado al paciente
                const usuarioPaciente = await Usuario.findOne({
                    where: {
                        id: paciente['dataValues']['fk_idUsuario'],
                        activo: true
                    }
                })

                //si el paciente tiene un usuario asociado, traer su email y teléfono
                const { email, telefono } = usuarioPaciente['dataValues']

                //response final
                const pacienteResponse = {
                    id: paciente['dataValues']['id'],
                    idUsuario: paciente['dataValues']['fk_idUsuario'],
                    nombre: paciente['dataValues']['nombre'],
                    apellido: paciente['dataValues']['apellido'],
                    dni: paciente['dataValues']['dni'],
                    tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                    idTipoDNI: paciente['dataValues']['fk_idTipoDNI'],
                    fechaNacimiento: paciente['dataValues']['fechaNacimiento'],
                    obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                    idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                    plan: plan ? plan['dataValues']['nombre'] : null,
                    idPlan: plan ? plan['dataValues']['id'] : null,
                    numeroAfiliado: paciente['dataValues']['numeroAfiliado'],
                    email,
                    telefono
                }
                res.status(200).json(pacienteResponse)
            } else {
                //response final
                const pacienteResponse = {
                    msg: "Paciente sin usuario asociado - Paciente creado por la institución",
                    id: paciente['dataValues']['id'],
                    idUsuario: paciente['dataValues']['fk_idUsuario'],
                    nombre: paciente['dataValues']['nombre'],
                    apellido: paciente['dataValues']['apellido'],
                    dni: paciente['dataValues']['dni'],
                    tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                    idTipoDNI: paciente['dataValues']['fk_idTipoDNI'],
                    fechaNacimiento: paciente['dataValues']['fechaNacimiento'],
                    obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                    idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                    plan: plan ? plan['dataValues']['nombre'] : null,
                    idPlan: plan ? plan['dataValues']['id'] : null,
                    numeroAfiliado: paciente['dataValues']['numeroAfiliado'],
                    email: paciente['dataValues']['emailPersonal'],
                    telefono: paciente['dataValues']['telefonoPersonal']
                }
                res.status(200).json(pacienteResponse)
            }
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

            const usuario = await Usuario.findOne({
                where: {
                    email: email,
                    activo: true
                }
            })

            if (usuario) {
                throw new Error("El email que intenta ingresar ya pertenece a un usuario en el sistema")
            }

            const pacienteToFind = await Paciente.findOne({
                where: {
                    [Op.or]: {
                        dni: dni,
                        emailPersonal: email,
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
            }else if((pacienteToFind ? pacienteToFind['dataValues']['emailPersonal'] : 0) == email){
                throw new Error("El email ingresado ya se encuentra en uso. Por favor, ingrese uno diferente.")
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

            //obtener datos restantes - tipoDNI, obraSocial y plan
            const tipoDNI = await TipoDNI.findByPk(newPaciente['dataValues']['fk_idTipoDNI'])
            const obraSocial = newPaciente['dataValues']['fk_idObraSocial'] ? await ObraSocial.findByPk(newPaciente['dataValues']['fk_idObraSocial']) : null
            const plan = newPaciente['dataValues']['fk_idPlan'] ? await Plan.findByPk(newPaciente['dataValues']['fk_idPlan']) : null

            //response final
            const pacienteResponse = {
                msg: "Paciente sin usuario asociado - Paciente creado por la institución",
                id: newPaciente['dataValues']['id'],
                idUsuario: newPaciente['dataValues']['fk_idUsuario'],
                nombre: newPaciente['dataValues']['nombre'],
                apellido: newPaciente['dataValues']['apellido'],
                dni: newPaciente['dataValues']['dni'],
                tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                idTipoDNI: newPaciente['dataValues']['fk_idTipoDNI'],
                fechaNacimiento: newPaciente['dataValues']['fechaNacimiento'],
                obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                plan: plan ? plan['dataValues']['nombre'] : null,
                idPlan: plan ? plan['dataValues']['id'] : null,
                numeroAfiliado: newPaciente['dataValues']['numeroAfiliado'],
                email: newPaciente['dataValues']['emailPersonal'],
                telefono: newPaciente['dataValues']['telefonoPersonal']
            }

            res.status(200).json({
                msg: "Paciente creado con éxito",
                newPaciente: pacienteResponse
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

            //obtener datos restantes - tipoDNI, obraSocial y plan
            const tipoDNI = await TipoDNI.findByPk(pacienteToEdit['dataValues']['fk_idTipoDNI'])
            const obraSocial = pacienteToEdit['dataValues']['fk_idObraSocial'] ? await ObraSocial.findByPk(pacienteToEdit['dataValues']['fk_idObraSocial']) : null
            const plan = pacienteToEdit['dataValues']['fk_idPlan'] ? await Plan.findByPk(pacienteToEdit['dataValues']['fk_idPlan']) : null

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

                //si el paciente tiene un usuario asociado, traer su email y teléfono
                const emailUsuario = usuarioToFind['dataValues']['email']
                const telefonoUsuario = usuarioToFind['dataValues']['telefono']

                //response final
                const pacienteResponse = {
                    id: pacienteToEdit['dataValues']['id'],
                    idUsuario: pacienteToEdit['dataValues']['fk_idUsuario'],
                    nombre: pacienteToEdit['dataValues']['nombre'],
                    apellido: pacienteToEdit['dataValues']['apellido'],
                    dni: pacienteToEdit['dataValues']['dni'],
                    tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                    idTipoDNI: pacienteToEdit['dataValues']['fk_idTipoDNI'],
                    fechaNacimiento: pacienteToEdit['dataValues']['fechaNacimiento'],
                    obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                    idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                    plan: plan ? plan['dataValues']['nombre'] : null,
                    idPlan: plan ? plan['dataValues']['id'] : null,
                    numeroAfiliado: pacienteToEdit['dataValues']['numeroAfiliado'],
                    email: emailUsuario,
                    telefono: telefonoUsuario
                }

                res.status(200).json({
                    msg: "Paciente actualizado correctamente.",
                    pacienteEdited: pacienteResponse
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

                //response final
                const pacienteResponse = {
                    msg: "Paciente sin usuario asociado - Paciente creado por la institución",
                    id: pacienteToEdit['dataValues']['id'],
                    idUsuario: pacienteToEdit['dataValues']['fk_idUsuario'],
                    nombre: pacienteToEdit['dataValues']['nombre'],
                    apellido: pacienteToEdit['dataValues']['apellido'],
                    dni: pacienteToEdit['dataValues']['dni'],
                    tipoDNI: tipoDNI['dataValues']['tipoDNI'],
                    idTipoDNI: pacienteToEdit['dataValues']['fk_idTipoDNI'],
                    fechaNacimiento: pacienteToEdit['dataValues']['fechaNacimiento'],
                    obraSocial: obraSocial ? obraSocial['dataValues']['nombre'] : null,
                    idObraSocial: obraSocial ? obraSocial['dataValues']['id'] : null,
                    plan: plan ? plan['dataValues']['nombre'] : null,
                    idPlan: plan ? plan['dataValues']['id'] : null,
                    numeroAfiliado: pacienteToEdit['dataValues']['numeroAfiliado'],
                    email: pacienteToEdit['dataValues']['emailPersonal'],
                    telefono: pacienteToEdit['dataValues']['telefonoPersonal']
                }

                res.status(200).json({
                    msg: "Paciente actualizado correctamente.",
                    pacienteEdited: pacienteResponse
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