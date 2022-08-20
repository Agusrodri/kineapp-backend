//buscar todos los roles de ese usuario
//devolver los permisos de cada rol
//buscar los roles internos que pueda tener en cada persona juridica a la que pertenece
//devolver los permisos internos dentro de cada persona juridica

import Permiso from "../models/entities/usersModule/permiso"
import Rol from "../models/entities/usersModule/rol"
import RolPermiso from "../models/entities/usersModule/rolPermiso"
import UsuarioRol from "../models/entities/usersModule/usuarioRol"

export default async (idUsuario: number) => {
    const rolesUsuarioToFind = await UsuarioRol.findAll({
        where: {
            fk_idUsuario: idUsuario
        }
    })

    const rolesUsuarioResponse = []

    for (let i = 0; i < rolesUsuarioToFind.length; i++) {

        const rolToFind = await Rol.findOne({
            where: {
                id: rolesUsuarioToFind[i]['dataValues']['fk_idRol'],
                activo: true
            }
        })

        if (!rolToFind) {
            continue
        }
        const rolName = rolToFind['dataValues']['nombreRol']
        const idRol = rolToFind['dataValues']['id']
        const rolpermisosToFind = await RolPermiso.findAll({
            where: {
                fk_idRol: rolToFind['dataValues']['id']
            }
        })

        const permisos = []

        for (let k = 0; k < rolpermisosToFind.length; k++) {

            const { habilitadoPermiso } = rolpermisosToFind[k]['dataValues']
            const permiso = await Permiso.findByPk(rolpermisosToFind[k]['dataValues']['fk_idPermiso'])
            const idPermiso = permiso['dataValues']['id']
            const { nombrePermiso, icon, nombreMenu, rutaFront } = permiso['dataValues']

            const permisoToAdd = {
                idPermiso: idPermiso,
                nombrePermiso: nombrePermiso,
                habilitadoPermiso: habilitadoPermiso,
                icon: icon,
                nombreMenu: nombreMenu,
                rutaFront: rutaFront
            }
            permisos.push(permisoToAdd)
        }

        const rolUsuario = {
            idUsuario: idUsuario,
            idRol: idRol,
            nombreRol: rolName,
            permisos: permisos
        }

        rolesUsuarioResponse.push(rolUsuario)
    }
    return rolesUsuarioResponse
}