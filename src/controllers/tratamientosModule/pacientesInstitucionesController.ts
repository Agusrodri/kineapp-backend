import { Request, Response } from 'express';
import Paciente from '../../models/entities/usersModule/paciente';
import PersonaJuridicaPaciente from '../../models/entities/usersModule/personaJuridicaPaciente';

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
    }


}

export default pacientesInstitucionesController;