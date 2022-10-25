DROP TABLE IF EXISTS rutinas, txWithdrawHistory;

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
    txHash NVARCHAR(300),
    idUser BIGINT,
    addressTo NVARCHAR(255),
    txAmount DECIMAL(18,9),
    txDate DATETIME

    PRIMARY KEY(id)
);