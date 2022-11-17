import { Request, Response } from 'express';
import Turno from '../../models/entities/turnosModule/turno';
import Convenio from '../../models/entities/obrasSocialesModule/convenio';
import db from '../../database/connection';
import Paciente from '../../models/entities/usersModule/paciente';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import { Op } from 'sequelize';
const ordenesController = {

    generarOrdenes: async (req: Request, res: Response) => {

        try {

            const { idPersonaJuridica } = req.params;
            const { mes, anio } = req.body;
            const convenios = await Convenio.findAll({
                where: {
                    fk_idPersonaJuridica: idPersonaJuridica,
                    activo: true
                }
            })

            if (!convenios) {
                throw new Error("No existen convenios en esta institución.")
            }

            const response = []
            for (let i = 0; i < convenios.length; i++) {

                const turnos = await Turno.findAll({
                    attributes: [
                        [db.fn('SUM', db.col('monto')), 'montoTotal'],
                        [db.fn('COUNT', db.col('id')), 'cantidadSesiones'],
                        'fk_idPaciente',
                        'fk_idTratamiento'
                    ],
                    where: {
                        obraSocial: convenios[i]['dataValues']['nombre'],
                        createdAt: {
                            [Op.between]: [new Date(`${anio}-${mes}-01`), new Date(`${anio}-${mes}-31`)]
                        },
                    },
                    group: ['fk_idTratamiento', 'fk_idPaciente']
                })

                const ordenesPagoConvenio = []
                for (let index = 0; index < turnos.length; index++) {

                    const paciente = await Paciente.findByPk(turnos[index]['dataValues']['fk_idPaciente'])
                    const tratamiento = await TratamientoParticular.findByPk(turnos[index]['dataValues']['fk_idTratamiento'])

                    const ordenToAdd = {
                        paciente: paciente ? `${paciente['dataValues']['apellido']}, ${paciente['dataValues']['nombre']}` : null,
                        numeroAfiliado: paciente ? (paciente['dataValues']['numeroAfiliado'] ? paciente['dataValues']['numeroAfiliado'] : null) : null,
                        tratamiento: tratamiento ? tratamiento['dataValues']['nombre'] : null,
                        cantidadSesiones: turnos[index]['dataValues']['cantidadSesiones'],
                        montoTotal: turnos[index]['dataValues']['montoTotal']
                    }

                    ordenesPagoConvenio.push(ordenToAdd);
                }

                const responseToAdd = {
                    convenio: convenios[i]['dataValues']['nombre'],
                    ordenesPago: ordenesPagoConvenio
                }

                response.push(responseToAdd);
            }

            res.status(200).json(response);

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }

}

export default ordenesController;

