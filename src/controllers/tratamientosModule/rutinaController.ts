import { Request, Response } from 'express';
import TratamientoPaciente from '../../models/entities/tratamientosModule/tratamientoPaciente';
import Rutina from '../../models/entities/tratamientosModule/rutina';
import RutinaEjercicio from '../../models/entities/tratamientosModule/rutinaEjercicio';
import Profesional from '../../models/entities/usersModule/profesional';
import PersonaJuridica from '../../models/entities/usersModule/personaJuridica';
import Ejercicio from '../../models/entities/tratamientosModule/ejercicio';
import Paciente from '../../models/entities/usersModule/paciente';
import Usuario from '../../models/entities/usersModule/usuario';
import Notificacion from '../../models/entities/usersModule/notificacion';
import TratamientoParticular from '../../models/entities/obrasSocialesModule/tratamientoParticular';
import sendNotification from '../../helpers/sendNotification';

const rutinaController = {

    createRutina: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params;
            const { idPersonaJuridica, idProfesional, ejercicios } = req.body;
            const tratamientoPaciente = await TratamientoPaciente.findOne({
                where: {
                    id: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!tratamientoPaciente) {
                throw new Error("No existe el tratamiento solicitado.")
            }

            if (tratamientoPaciente['dataValues']['finalizado'] == true) {
                throw new Error("No fue posible crear la rutina. El tratamiento se encuentra finalizado.")
            }

            const rutinaToFind = await Rutina.findOne({
                where: {
                    fk_idTratamientoPaciente: idTratamientoPaciente,
                    activo: true,
                    finalizada: false
                }
            })

            if (rutinaToFind) {
                throw new Error("El paciente ya posee una rutina activa dentro de este tratamiento. Finalice la misma antes de agregar una nueva.")
            }

            const profesional = await Profesional.findByPk(idProfesional ? idProfesional : 0)
            const institucion = await PersonaJuridica.findByPk(idPersonaJuridica ? idPersonaJuridica : 0)
            const nombreProfesionalToSet = profesional ?
                (`${profesional['dataValues']['nombre']} ${profesional['dataValues']['apellido']}`) :
                (institucion ? (`${institucion['nombre']}`) : "Nombre del profesional desconocido.")

            const newDateLastRacha = new Date();
            const utcDayRacha = ((((newDateLastRacha.toISOString()).split("T")))[0].split("-"))[2];
            const newDateLastRachaUTC = new Date(Date.UTC(newDateLastRacha.getFullYear(),
                newDateLastRacha.getMonth(),
                Number(utcDayRacha),
                0,
                0,
                0,
                0
            ))

            const newRutina = await Rutina.create({
                //order: 
                fk_idTratamientoPaciente: idTratamientoPaciente,
                fk_idProfesional: idProfesional ? idProfesional : (idPersonaJuridica ? idPersonaJuridica : null),
                isInstitucion: (idPersonaJuridica ? true : false),
                profesional: nombreProfesionalToSet,
                activo: true,
                finalizada: false,
                fechaFinalizacion: null,
                contadorRacha: 0,
                dateLastRacha: newDateLastRachaUTC.getTime().toString()
            })

            const ejerciciosRutina = []

            for (let i = 0; i < ejercicios.length; i++) {

                const newRutinaEjercicio = await RutinaEjercicio.create({
                    duracion: ejercicios[i]['duracion'],
                    cantidadRepeticiones: ejercicios[i]['repeticiones'],
                    //contadorCheck:
                    fk_idRutina: newRutina['dataValues']['id'],
                    fk_idEjercicio: ejercicios[i]['id'],
                    nombreEjercicio: ejercicios[i]['nombre']
                })

                ejerciciosRutina.push(newRutinaEjercicio)

            }

            const rutinaResponse = {
                id: newRutina['dataValues']['id'],
                orden: newRutina['dataValues']['orden'],
                idTratamientoPaciente: newRutina['dataValues']['fk_idTratamientoPaciente'],
                idProfesional: newRutina['dataValues']['fk_idProfesional'],
                activo: newRutina['dataValues']['activo'],
                finalizada: newRutina['dataValues']['finalizada'],
                fechaFinalizacion: newRutina['dataValues']['fechaFinalizacion'],
                profesional: newRutina['dataValues']['profesional'],
                contadorRacha: newRutina['dataValues']['contadorRacha'],
                dateLastRacha: newRutina['dataValues']['dateLastRacha'],
                rutinaEjercicios: ejerciciosRutina

            }

            const paciente = await Paciente.findOne({
                where: {
                    id: tratamientoPaciente['dataValues']['fk_idPaciente'],
                    activo: true
                }
            })

            const tratamientoParticular = await TratamientoParticular.findOne({
                where: {
                    id: tratamientoPaciente['dataValues']['fk_idTratamiento'],
                    activo: true
                }
            })

            const nombreTratamiento = tratamientoParticular ? ` dentro del tratamiento ${tratamientoParticular['dataValues']['nombre']}.` : `.`;

            if (paciente && paciente['dataValues']['fk_idUsuario']) {

                const notificationBody = `El profesional ${newRutina['dataValues']['profesional']} te asignó una rutina${nombreTratamiento}`
                const usuario = await Usuario.findByPk(paciente['dataValues']['fk_idUsuario']);

                if (usuario && usuario['dataValues']['subscription']) {

                    await Notificacion.create({
                        texto: notificationBody,
                        check: false,
                        fk_idUsuario: usuario['dataValues']['id'],
                        titulo: "Asignación de Rutina"
                    })
                    sendNotification(usuario['dataValues']['subscription'], notificationBody)
                }
            }

            res.status(200).json({
                msg: "Rutina creada con éxito.",
                rutina: rutinaResponse
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getRutinaById: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const rutinaToFind = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToFind) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            const rutinaEjercicios = await RutinaEjercicio.findAll({
                where: {
                    fk_idRutina: rutinaToFind['dataValues']['id']
                }
            })

            const rutinaEjerciciosRes = []
            for (let i = 0; i < rutinaEjercicios.length; i++) {

                const ejercicio = await Ejercicio.findOne({
                    where: {
                        id: rutinaEjercicios[i]['dataValues']['fk_idEjercicio'],
                        activo: true
                    }
                })

                const rutinaEjercicio = {
                    id: rutinaEjercicios[i]['dataValues']['id'],
                    duracion: rutinaEjercicios[i]['dataValues']['duracion'],
                    fk_idRutina: rutinaEjercicios[i]['dataValues']['fk_idRutina'],
                    fk_idEjercicio: rutinaEjercicios[i]['dataValues']['fk_idEjercicio'],
                    nombreEjercicio: rutinaEjercicios[i]['dataValues']['nombreEjercicio'],
                    cantidadRepeticiones: rutinaEjercicios[i]['dataValues']['cantidadRepeticiones'],
                    contadorCheck: rutinaEjercicios[i]['dataValues']['contadorCheck'] ? rutinaEjercicios[i]['dataValues']['contadorCheck'] : null,
                    complejidad: ejercicio ? ejercicio['dataValues']['complejidad'] : null,
                    descripcion: ejercicio ? ejercicio['dataValues']['descripcion'] : null,
                    gif: ejercicio ? ejercicio['dataValues']['gif'] : null,
                    fk_idPersonaJuridica: ejercicio ? ejercicio['dataValues']['fk_idPersonaJuridica'] : null,
                    activo: ejercicio ? ejercicio['dataValues']['activo'] : null

                }

                rutinaEjerciciosRes.push(rutinaEjercicio)
            }

            const responseFinal = {
                id: rutinaToFind['dataValues']['id'],
                idTratamientoPaciente: rutinaToFind['dataValues']['fk_idTratamientoPaciente'],
                idProfesional: rutinaToFind['dataValues']['fk_idProfesional'],
                activo: rutinaToFind['dataValues']['activo'],
                finalizada: rutinaToFind['dataValues']['finalizada'],
                fechaFinalizacion: rutinaToFind['dataValues']['fechaFinalizacion'],
                profesional: rutinaToFind['dataValues']['profesional'],
                contadorRacha: rutinaToFind['dataValues']['contadorRacha'],
                dateLastRacha: rutinaToFind['dataValues']['dateLastRacha'],
                rutinaEjercicios: rutinaEjerciciosRes,
                jsonRutina: rutinaToFind['dataValues']['jsonRutina'] ? rutinaToFind['dataValues']['jsonRutina'] : null,
                mostrarRutinaBandera: rutinaToFind['dataValues']['mostrarRutinaBandera'] != null ? rutinaToFind['dataValues']['mostrarRutinaBandera'] : null
            }

            res.status(200).json(responseFinal)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    editarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const ejercicios = req.body

            const rutinaToEdit = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToEdit) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            if (rutinaToEdit['dataValues']['finalizada'] == true) {
                throw new Error("No fue posible editar la rutina. La misma ya se encuentra finalizada.")
            }

            await RutinaEjercicio.destroy({
                where: {
                    fk_idRutina: rutinaToEdit['dataValues']['id']
                }
            })

            const ejerciciosRutina = []

            for (let i = 0; i < ejercicios.length; i++) {

                const newRutinaEjercicio = await RutinaEjercicio.create({
                    duracion: ejercicios[i]['duracion'],
                    cantidadRepeticiones: ejercicios[i]['cantidadRepeticiones'],
                    //contadorCheck:
                    fk_idRutina: rutinaToEdit['dataValues']['id'],
                    fk_idEjercicio: ejercicios[i]['id'],
                    nombreEjercicio: ejercicios[i]['nombre']
                })

                ejerciciosRutina.push(newRutinaEjercicio)

            }

            const responseFinal = {
                id: rutinaToEdit['dataValues']['id'],
                idTratamientoPaciente: rutinaToEdit['dataValues']['fk_idTratamientoPaciente'],
                idProfesional: rutinaToEdit['dataValues']['fk_idProfesional'],
                activo: rutinaToEdit['dataValues']['activo'],
                finalizada: rutinaToEdit['dataValues']['finalizada'],
                fechaFinalizacion: rutinaToEdit['dataValues']['fechaFinalizacion'],
                profesional: rutinaToEdit['dataValues']['profesional'],
                contadorRacha: rutinaToEdit['dataValues']['contadorRacha'],
                dateLastRacha: rutinaToEdit['dataValues']['dateLastRacha'],
                rutinaEjercicios: ejerciciosRutina
            }

            res.status(200).json({
                msg: "Rutina actualizada con éxito.",
                rutina: responseFinal
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    finalizarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const rutinaToEnd = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToEnd) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            if (rutinaToEnd['dataValues']['finalizada'] == true) {
                throw new Error("La rutina ya se encuentra finalizada.")
            }

            const fechaFinRutina = (new Date()).toISOString().split("T")[0]
            await rutinaToEnd.update({ finalizada: true, fechaFinalizacion: fechaFinRutina, jsonRutina: null })

            const rutinaEjercicios = await RutinaEjercicio.findAll({
                where: {
                    fk_idRutina: rutinaToEnd['dataValues']['id']
                }
            })

            const rutinaEjerciciosRes = []
            for (let i = 0; i < rutinaEjercicios.length; i++) {

                const rutinaEjercicio = {
                    id: rutinaEjercicios[i]['dataValues']['id'],
                    duracion: rutinaEjercicios[i]['dataValues']['duracion'],
                    fk_idRutina: rutinaEjercicios[i]['dataValues']['fk_idRutina'],
                    fk_idEjercicio: rutinaEjercicios[i]['dataValues']['fk_idEjercicio'],
                    nombreEjercicio: rutinaEjercicios[i]['dataValues']['nombreEjercicio'],
                    cantidadRepeticiones: rutinaEjercicios[i]['dataValues']['cantidadRepeticiones']
                }

                rutinaEjerciciosRes.push(rutinaEjercicio)
            }

            const responseFinal = {
                id: rutinaToEnd['dataValues']['id'],
                idTratamientoPaciente: rutinaToEnd['dataValues']['fk_idTratamientoPaciente'],
                idProfesional: rutinaToEnd['dataValues']['fk_idProfesional'],
                activo: rutinaToEnd['dataValues']['activo'],
                finalizada: rutinaToEnd['dataValues']['finalizada'],
                fechaFinalizacion: rutinaToEnd['dataValues']['fechaFinalizacion'],
                profesional: rutinaToEnd['dataValues']['profesional'],
                contadorRacha: rutinaToEnd['dataValues']['contadorRacha'],
                dateLastRacha: rutinaToEnd['dataValues']['dateLastRacha'],
                rutinaEjercicios: rutinaEjerciciosRes
            }

            res.status(200).json({
                msg: "Rutina finalizada con éxito.",
                rutina: responseFinal
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    eliminarRutina: async (req: Request, res: Response) => {

        try {

            const { idRutina } = req.params
            const rutinaToDelete = await Rutina.findOne({
                where: {
                    id: idRutina,
                    activo: true
                }
            })

            if (!rutinaToDelete) {
                throw new Error("No se encontró la rutina solicitada.")
            }

            await rutinaToDelete.update({ activo: false, jsonRutina: null })

            res.status(200).json({
                msg: "Rutina eliminada correctamente."
            })

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    },

    getRutinasPaciente: async (req: Request, res: Response) => {

        try {

            const { idTratamientoPaciente } = req.params
            const rutinas = await Rutina.findAll({
                where: {
                    fk_idTratamientoPaciente: idTratamientoPaciente,
                    activo: true
                }
            })

            if (!rutinas) {
                throw new Error("No existen rutinas cargadas para este tratamiento.")
            }

            const response = []

            for (let i = 0; i < rutinas.length; i++) {

                //let mostrarRutinaBandera: boolean;
                if (!rutinas[i]['dataValues']['finalizada']) {

                    //levar fecha actual a las 00
                    const newDate = new Date();
                    const utcDay = ((((newDate.toISOString()).split("T")))[0].split("-"))[2];
                    const newDateUTC = new Date(Date.UTC(newDate.getFullYear(),
                        newDate.getMonth(),
                        Number(utcDay),
                        0,
                        0,
                        0,
                        0
                    ));

                    //llevar fecha última modificación a las 00.
                    const dateLastUpdate = rutinas[i]['dataValues']['updatedAt'];
                    const utcDayLastUpdate = ((((dateLastUpdate.toISOString()).split("T")))[0].split("-"))[2];
                    const newDateLastUpdateUTC = new Date(Date.UTC(dateLastUpdate.getFullYear(),
                        dateLastUpdate.getMonth(),
                        Number(utcDayLastUpdate),
                        0,
                        0,
                        0,
                        0
                    ));

                    const newDateDayFinal = ((((newDateUTC.toISOString()).split("T")))[0].split("-"))[2];
                    const dateLastUpdateDayFinal = ((((newDateLastUpdateUTC.toISOString()).split("T")))[0].split("-"))[2];

                    const diffDays = newDateDayFinal == dateLastUpdateDayFinal;
                    //diffDays ? mostrarRutinaBandera = false : mostrarRutinaBandera = true;

                    const jsonRutinaToEdit = rutinas[i]['dataValues']['jsonRutina'] ? JSON.parse(rutinas[i]['dataValues']['jsonRutina']) : null;
                    if (!diffDays) {
                        await rutinas[i].update({ mostrarRutinaBandera: true });
                        jsonRutinaToEdit.forEach(repeticion => {
                            repeticion.checked = false;
                            repeticion.ejercicios.forEach(ejercicio => {
                                ejercicio.contadorCheck = 0;
                                ejercicio.checked = false;
                            });
                        });
                    }

                    //obtenemos la fecha donde se actualizó ese último valor de contador
                    const dateLastRacha = rutinas[i]['dataValues']['dateLastRacha'];
                    const newDateLastRachaFormat = new Date(Number(dateLastRacha));

                    //creamos una fecha actual para actualizar dateLastRacha de rutina
                    const newDateLastRacha = new Date();
                    const utcDayRacha = ((((newDateLastRacha.toISOString()).split("T")))[0].split("-"))[2];
                    const newDateLastRachaUTC = new Date(Date.UTC(newDateLastRacha.getFullYear(),
                        newDateLastRacha.getMonth(),
                        Number(utcDayRacha),
                        0,
                        0,
                        0,
                        0
                    ));

                    //realizamos la diferencia entre la nueva fecha y la anterior
                    const difBetweenDates = Number(newDateLastRachaUTC.getTime()) - Number(newDateLastRachaFormat.getTime())
                    const secondsDifBetweenDates = difBetweenDates / 1000

                    const difBetweenDatesUpdate = Number(newDateUTC.getTime()) - Number(newDateLastUpdateUTC.getTime())
                    const secondsDifBetweenDatesUpdate = difBetweenDatesUpdate / 1000

                    //si la diferencia es mayor a 2 días, el contador se resetea 
                    Math.abs(secondsDifBetweenDatesUpdate) >= 172800 ? await rutinas[i].update({ contadorRacha: 0 }) : false;
                    Math.abs(secondsDifBetweenDates) >= 172800 ? await rutinas[i].update({ contadorRacha: 0 }) : false;

                    if (jsonRutinaToEdit) {

                        if (Math.abs(secondsDifBetweenDatesUpdate) >= 172800) {
                            await rutinas[i].update({ contadorRacha: 0, jsonRutina: JSON.stringify(jsonRutinaToEdit) });
                        }

                        if (Math.abs(secondsDifBetweenDates) >= 172800) {
                            await rutinas[i].update({ contadorRacha: 0, jsonRutina: JSON.stringify(jsonRutinaToEdit) })

                        }
                    }
                }

                const rutinaEjercicios = await RutinaEjercicio.findAll({
                    where: {
                        fk_idRutina: rutinas[i]['dataValues']['id']
                    }
                })

                const rutinaEjerciciosRes = []
                for (let i = 0; i < rutinaEjercicios.length; i++) {

                    const rutinaEjercicio = {
                        id: rutinaEjercicios[i]['dataValues']['id'],
                        duracion: rutinaEjercicios[i]['dataValues']['duracion'],
                        fk_idRutina: rutinaEjercicios[i]['dataValues']['fk_idRutina'],
                        fk_idEjercicio: rutinaEjercicios[i]['dataValues']['fk_idEjercicio'],
                        nombreEjercicio: rutinaEjercicios[i]['dataValues']['nombreEjercicio'],
                        cantidadRepeticiones: rutinaEjercicios[i]['dataValues']['cantidadRepeticiones']
                    }

                    rutinaEjerciciosRes.push(rutinaEjercicio)
                }

                const responseRutina = {
                    id: rutinas[i]['dataValues']['id'],
                    idTratamientoPaciente: rutinas[i]['dataValues']['fk_idTratamientoPaciente'],
                    idProfesional: rutinas[i]['dataValues']['fk_idProfesional'],
                    activo: rutinas[i]['dataValues']['activo'],
                    finalizada: rutinas[i]['dataValues']['finalizada'],
                    fechaFinalizacion: rutinas[i]['dataValues']['fechaFinalizacion'],
                    profesional: rutinas[i]['dataValues']['profesional'],
                    contadorRacha: rutinas[i]['dataValues']['contadorRacha'],
                    dateLastRacha: rutinas[i]['dataValues']['dateLastRacha'],
                    rutinaEjercicios: rutinaEjerciciosRes,
                    mostrarRutinaBandera: !rutinas[i]['dataValues']['jsonRutina'] ? true : (rutinas[i]['dataValues']['mostrarRutinaBandera'] != null ? rutinas[i]['dataValues']['mostrarRutinaBandera'] : null)
                }
                response.push(responseRutina)
            }
            res.status(200).json(response)

        } catch (error) {
            res.status(500).json({
                msg: `${error}`
            });
        }
    }
}

export default rutinaController;