DROP TABLE IF EXISTS rutinas, tratamientopacientes, ejercicios, convenios;

CREATE TABLE rutinas (
    id BIGINT NOT NULL identity(1, 1),
    fk_idTratamientoPaciente BIGINT NOT NULL,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    activo TINYINT,
    finalizada TINYINT,
    fechaFinalizacion DATE,
    fk_idProfesional BIGINT NOT NULL,
    profesional NVARCHAR(55),
    contadorRacha INT,
    dateLastRacha NVARCHAR(55),
    jsonRutina NVARCHAR(300),
    mostrarRutinaBandera TINYINT,
    isInstitucion TINYINT,
    FOREIGN KEY (fk_idTratamientoPaciente) REFERENCES tratamientopacientes(id),
    FOREIGN KEY (fk_idProfesional) REFERENCES profesionales(id),

    PRIMARY KEY(id)
);

CREATE TABLE tratamientopacientes (
    id BIGINT NOT NULL identity(1, 1),
    fechaInicio DATE,
    fechaFinEstimada DATE,
    fk_idPaciente BIGINT NOT NULL,
    fk_idTratamiento BIGINT NOT NULL,
    fk_idPersonaJuridica BIGINT NOT NULL,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    activo TINYINT,
    fechaFinReal DATE,
    nombrePaciente NVARCHAR(55),
    finalizado TINYINT,
    FOREIGN KEY (fk_idPaciente) REFERENCES pacientes(id),
    FOREIGN KEY (fk_idTratamiento) REFERENCES tratamientoparticulares(id),
    FOREIGN KEY (fk_idPersonaJuridica) REFERENCES personajuridicas(id),

    PRIMARY KEY(id)
);

CREATE TABLE ejercicios (
    id BIGINT NOT NULL identity(1, 1),
    nombre NVARCHAR(55),
    complejidad NVARCHAR(55),
    descripcion NVARCHAR(55),
    gif NVARCHAR(55),
    fk_idPersonaJuridica BIGINT NOT NULL,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    activo TINYINT,
    FOREIGN KEY (fk_idPersonaJuridica) REFERENCES personajuridicas(id),

    PRIMARY KEY(id)
);

CREATE TABLE convenios (
    id BIGINT NOT NULL identity(1, 1),
    nombre NVARCHAR(55),
    descripcion NVARCHAR(55),
    fk_idObraSocial BIGINT NOT NULL,
    fk_idPersonaJuridica BIGINT NOT NULL,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    activo TINYINT,
    FOREIGN KEY (fk_idPersonaJuridica) REFERENCES personajuridicas(id),
    FOREIGN KEY (fk_idObraSocial) REFERENCES obrasociales(id),

    PRIMARY KEY(id)
);