export interface Usuario {
    idUsuario?: number,
    usuario?: string,
    contraseña?: string,
    email?: string,
    numeroTel?: string,
    fk_idEstadoUsuario?: number
}

export interface UsuarioRol {
    idUsuarioRol?: number,
    fk_idUsuarioRol?: number,
    fk_idRol?: number
}

export interface Rol {
    idRol?: number,
    nombreRol?: string,
    descripcionRol?: string
}

export interface RolPermiso {
    idRolPermiso?: number,
    fk_idRol?: number,
    fk_idPermiso?: number,
    habilitadoPermiso?: boolean
}

export interface Permiso {
    idPermiso?: number,
    nombrePermiso?: string
}


