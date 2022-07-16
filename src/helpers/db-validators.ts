
import Rol from "../models/entities/rol";

const dbValidators = {

    existsRolWithName: async (nombreRol: string) => {

        const rol = await Rol.findAll({
            where: {
                nombreRol: nombreRol
            }
        })

        if (rol.length > 0) {
            throw new Error(`El rol con nombre -${nombreRol}- ya existe`)
        }

    }

}

export default dbValidators;