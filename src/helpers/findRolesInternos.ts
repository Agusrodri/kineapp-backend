import RolInterno from "../models/entities/usersModule/rolInterno"
import PersonaJuridicaProfesional from "../models/entities/usersModule/personaJuridicaProfesional"
import Profesional from "../models/entities/usersModule/profesional"
import RolInternoPermisoInterno from "../models/entities/usersModule/rolInternoPermisoInterno"
import PermisoInterno from "../models/entities/usersModule/permisoInterno"
import PersonaJuridica from "../models/entities/usersModule/personaJuridica"


export default async (idUsuario: number) => {

    const profesionalToFind = await Profesional.findOne({
        where: {
            fk_idUsuario: idUsuario
        }
    })

    if (!profesionalToFind) { return }

    const pjProfesionales = await PersonaJuridicaProfesional.findAll({
        where: {
            fk_idProfesional: profesionalToFind['dataValues']['id']
        }
    })

    const response = [{
        idRolInterno: "",
        nombreRol: "",
        idInstitucion: "",
        institucion: "",
        permisos: [{
            nombrePermiso: "",
            habilitadoPermiso: ""
        }]

    }]

    const rolesInternosResponse = []

    for (let i = 0; i < pjProfesionales.length; i++) {

        const { fk_idPersonaJuridica, fk_idRolInterno } = pjProfesionales[i]['dataValues']
        const institucion = await PersonaJuridica.findByPk(fk_idPersonaJuridica)
        const { nombre } = institucion['dataValues']
        const idInstitucion = institucion['dataValues']['id']
        const rolInterno = await RolInterno.findByPk(fk_idRolInterno)
        const { nombreRol, id } = rolInterno['dataValues']

        const rolInternoPermisoInterno = await RolInternoPermisoInterno.findAll({
            where: {
                fk_idRolInterno: fk_idRolInterno
            }
        })

        const permisos = []

        for (let k = 0; k < rolInternoPermisoInterno.length; k++) {

            const { habilitadoPermiso } = rolInternoPermisoInterno[k]['dataValues']
            const permisoInterno = await PermisoInterno.findByPk(rolInternoPermisoInterno[k]['dataValues']['fk_idPermisoInterno'])

            const idPermisoInterno = permisoInterno['dataValues']['id']
            const { nombrePermiso, icon, nombreMenu, rutaFront } = permisoInterno['dataValues']

            const permisoInternoResponse = {
                id: idPermisoInterno,
                nombrePermiso: nombrePermiso,
                habilitadoPermiso: habilitadoPermiso,
                icon: icon,
                nombreMenu: nombreMenu,
                rutaFront: rutaFront
            }

            permisos.push(permisoInternoResponse)
        }

        const rolesInternosJson = {
            idRolInterno: id,
            nombreRol: nombreRol,
            idInstitucion: idInstitucion,
            institucion: nombre,
            permisos: permisos
        }

        rolesInternosResponse.push(rolesInternosJson)
    }
    return rolesInternosResponse
}