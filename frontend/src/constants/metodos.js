const metodos = {
  //AREAS-------------------------------------------------------------
  AREA_CREAR: "crearArea",
  AREA_ACTUALIZAR: "actualizarArea",
  AREA_BORRAR: "borrarArea",
  //ASISTENCIAS-------------------------------------------------------
  ASISTENCIA_CREAR: "asistenciaCrear",
  ASISTENCIA_ACTUALIZAR: "asistenciaActualizar",
  ASISTENCIA_LISTAR_TODO: "asistenciaListarTodo",
  ASISTENCIA_LISTAR_EFECTIVAS: "asistenciaListarEfectivas",
  //CARGOS------------------------------------------------------------
  CARGO_CREAR: "crearCargo",
  CARGO_ACTUALIZAR: "actualizarCargo",
  CARGO_BORRAR: "borrarCargo",
  //CONTRATAS---------------------------------------------------------
  CONTRATA_CREAR: "contrataCrear",
  CONTRATA_LISTAR_TODO: "contrataListarTodo",
  CONTRATA_LISTAR_NOMBRES: "contrataListarNombres",
  CONTRATA_EDITAR: "contrataEditar",
  CONTRATA_BAJA: "contrataBaja",
  //EMPLEADOS---------------------------------------------------------
  PERFIL_USUARIO: "perfilUsuario",
  EMPLEADOS_TODO_ROOT: "empleadosListarRoot",
  EMPLEADOS_BUSCAR_DETALLE: "empleadosBuscarDetalle",
  EMPLEADOS_LISTAR_TODO: "empleadosListarTodo",
  EMPLEADOS_LITAR_JEFES_CONTRATA: "empleadosListarJefesContrata",
  EMPLEADOS_LISTAR_AUDITORES: "empleadoListarAuditores",
  EMPLEADOS_LISTAR_SUPERVISORES: "empleadoListarSupervisores",
  EMPLEADOS_LISTAR_GESTORES: "empleadoListarGestores",
  EMPLEADOS_LISTAR_TECNICOS: "empleadoListarTecnicosGlobal",
  EMPLEADOS_LISTAR_APOYO: "empleadoListarTecnicosApoyo",
  EMPLEADOS_CREAR: "empleadosCrear",
  EMPLEADOS_ACTUALIZAR: "empleadosActualizar",
  EMPLEADOS_LISTAR_COLUMNAS: "empleadosListarColumnas",
  EMPLEADOS_ACTUALIZAR_COLUMNAS:"empleadosActualizarColumnas",
  EMPLEADOS_CAMBIAR_PASS: "empleadosCambiarPassword",
  EMPLEADOS_PASS_TOA: "empleadosCambiarPassToa",
  EMPLEADOS_RESET_PASS: "empleadosResetearPassword",
  EMPLEADOS_CERRAR_SESION: "empleadosCerrarSesion",
  EMPLEADOS_ACTUALIZAR_PERMISOS: "empleadosActualizarPermisos",
  EMPLEADOS_ACTIVAR_CUENTA: "empleadosActivarCuenta",
  EMPLEADOS_EDITAR_ESTADO_EMPRESA: "empleadosEditarEstadoEmpresa",
  EMPLEADOS_ACTUALIZAR_RUTA: "empleadosActualizarRuta",
  EMPLEADOS_AGREGAR_VISTAS: "empleadosAgregarVistas",
  //ORDENES------------------------------------------------------------
  ORDENES_SUBIR_DATA: "ordenesSubirData",
  ORDENES_COMPROBAR_INFANCIAS: "ordenesComprobarInfancias",
  ORDENES_ACTUALIZAR_LIQUIDADAS: "ordenesActualizarLiquidadas",
  ORDENES_OBTENER_PENDIENTES: "ordenesObtenerPendientes",
  ORDENES_OBTENER_P_EXPORTAR: "ordenesObtenerPendientesExportar",
  ORDENES_OBTENER_LIQUIDADAS: "ordenesObtenerLiquidadas",
  ORDENES_OBTENER_OTRAS_BANDEJAS: "ordenesObtenerOtrasBandejas",
  ORDENES_OBTENER_ANULADAS: "ordenesObtenerAnuladas",
  ORDENES_OBTENER_REITERADAS: "ordenesObtenerReiteradas",
  ORDENES_OBTENER_INFANCIA: "ordenesObtenerInfancia",
  ORDENES_BUSCAR_REGISTRO: "ordenesBuscarRegistro",
  ORDENES_BUSCAR_DETALLE: "ordenesBuscarDetalle",
  ORDENES_ASIGNAR: "ordenesAsignar",
  ORDENES_INDICADORES: "ordenesIndicadores",
  ORDENES_BUSCAR_ORDEN: "ordenesBuscarOrden",
  ORDENES_SOCKET_OBSERVACION: "ordenesObservacion",
  ORDENES_SOCKET_AGENDAR: "ordenesAgendar",
  ORDENES_SOCKET_ASIGNAR: "ordenesAsignar",
  ORDENES_SOCKET_ESTADO: "ordenesEstado",
  ORDENES_SOCKET_PENDIENTES: "obtenerPendientes",
  //TIPOS EMPLEADOS---------------------------------------------------
  TIPOEMPLEADO_CREAR: "crearTipoEmpleado",
  TIPOEMPLEADO_ACTUALIZAR: "actualizarTipoEmpleado",
  TIPOEMPLEADO_BORRAR: "borrarTipoEmpleado",
  //VISTAS------------------------------------------------------------
  VISTA_CREAR: "crearVista",
  VISTA_ACTUALIZAR: "actualizarVista",
  VISTA_BORRAR: "borrarVista",
  //ZONAS-------------------------------------------------------------
  ZONA_CREAR: "crearZona",
  ZONA_ACTUALIZAR: "actualizarZona",
  ZONA_BORRAR: "borrarZona",
  // SOCKET
  CLIENTE_RECIBIR_MENSAJE: "clienteRecibirMensaje",
  UNIR_SALA_PENDIENTES: "unirseSalaPendientes",
  DEJAR_SALA_PENDIENTES: "dejarSalaPendientes",
  UNIR_SALA_GESTOR_PENDIENTES: "unirseSalaGestorPendientes",
  REGISTRAR_CLIENTE: "registrarCliente"
};



export default metodos;
