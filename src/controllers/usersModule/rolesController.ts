import { Request, Response } from "express"
import { Op } from "sequelize"

import Rol from "../../models/entities/rol";
import RolPermiso from "../../models/entities/rolPermiso";
import Permiso from "../../models/entities/permiso";

const rolesController = {

    getRoles: async (req: Request, res: Response) => {

        try {

            const roles = await Rol.findAll()

            if (!roles) {
                res.status(404).json({
                    msg: "No existen roles"
                })
            }

            res.status(200).json(roles)


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
            });

        }

    },

    getRolById: async (req: Request, res: Response) => {

        try {

            const { id } = req.params

            const rol = await Rol.findAll({
                attributes: ['nombreRol', 'descripcionRol'],
                where: {
                    id: id
                }
            })

            const rolPermiso = await RolPermiso.findAll({
                attributes: ['habilitadoPermiso', 'fk_idPermiso'],
                where: {
                    fk_idRol: id
                }
            })

            const idPermisos = []

            for (let i = 0; i < rolPermiso.length; i++) {
                idPermisos[i] = rolPermiso[i]['dataValues']['fk_idPermiso']

            }

            const permisos = await Permiso.findAll({
                attributes: ['nombrePermiso'],
                where: {
                    id: {
                        [Op.or]: idPermisos
                    }
                }
            })

            const permisosJson = [{
                nombrePermiso: "",
                habilitadoPermiso: true
            }]

            for (let j = 0; j < rolPermiso.length; j++) {
                permisosJson[j] = {
                    nombrePermiso: permisos[j]['dataValues']['nombrePermiso'],
                    habilitadoPermiso: rolPermiso[j]['dataValues']['habilitadoPermiso']

                }
            }

            res.status(200).json({
                rol,
                permisosJson
            })


        } catch (error) {
            console.log(error)
            res.status(500).json({
                msg: 'Error - Hable con el administrador'
            });

        }

    }

}

export default rolesController;

