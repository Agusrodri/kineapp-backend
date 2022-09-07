import conveniosRoute from "./obrasSocialesModule/conveniosRoute"
import obrasSocialesRoute from "./obrasSocialesModule/obrasSocialesRoute"
import tratamientosGeneralesRoute from "./obrasSocialesModule/tratamientosGeneralesRoute"
import tratamientosParticularesRoute from "./obrasSocialesModule/tratamientosParticularesRoute"
import institucionesRoute from "./usersModule/institucionesRoute"
import loginRoute from "./usersModule/loginRoute"
import pacientesRoute from "./usersModule/pacientesRoute"
import profesionalesRoute from "./usersModule/profesionalesRoute"
import rolesInternosRoute from "./usersModule/rolesInternosRoute"
import rolesRoute from "./usersModule/rolesRoute"
import filesRoute from "./filesRoute/filesRoute"
import utilityRoute from "./utilityRoutes/utilityRoute"
import pacientesInstitucionesRoute from "./tratamientosModule/pacientesInstitucionesRoute"
import tratamientoPacienteRoute from "./tratamientosModule/tratamientoPacienteRoute"
import ejerciciosRoute from "./tratamientosModule/ejerciciosRoute"

export default [conveniosRoute, obrasSocialesRoute, tratamientosGeneralesRoute, tratamientosParticularesRoute,
    institucionesRoute, loginRoute, pacientesRoute, profesionalesRoute, rolesInternosRoute,
    rolesRoute, filesRoute, utilityRoute, pacientesInstitucionesRoute, tratamientoPacienteRoute, ejerciciosRoute]
