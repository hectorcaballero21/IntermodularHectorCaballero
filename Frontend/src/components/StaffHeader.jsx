import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../assets/css/sharedLayout.css'
import { createUsuario, deleteUsuario, getUsuarios } from '../services/usuarioService'
import { createAlerta, deleteAlerta, getAlertas, updateAlerta } from '../services/alertaService'
import { createMensajeContacto, deleteMensajeContacto, getMensajesContacto, marcarMensajeComoLeido, responderMensajeContacto } from '../services/mensajeContactoService'
import { useToast } from '../context/ToastContext'


function StaffHeader() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const usuarioLogeado = JSON.parse(localStorage.getItem('usuario') || 'null')

  const esAdmin =
    String(usuarioLogeado?.rol || '')
      .toLowerCase()
      .trim() === 'admin'

  const idUsuarioLogeado =
    usuarioLogeado?.id ??
    usuarioLogeado?.idUsuario

  const esUsuarioActual = (usuario) => {
    const idUsuario = usuario?.id ?? usuario?.idUsuario

    return Number(idUsuario) === Number(idUsuarioLogeado)
  }

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    rol: 'medico',
  })

  const [usuarios, setUsuarios] = useState([])
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null)
  const [paginaUsuarios, setPaginaUsuarios] = useState(1)
  const [mostrarConfirmacionEliminar, setMostrarConfirmacionEliminar] = useState(false)
  const [eliminandoUsuario, setEliminandoUsuario] = useState(false)

  const [alertas, setAlertas] = useState([])
  const [cargandoAlertas, setCargandoAlertas] = useState(true)
  const [formAlerta, setFormAlerta] = useState({
    tipo: 'Info',
    titulo: '',
    texto: '',
    activa: true,
  })

  const [alertaEditando, setAlertaEditando] = useState(null)

  const [mensajesContacto, setMensajesContacto] = useState([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null)
  const [formMensajeContacto, setFormMensajeContacto] = useState({
    asunto: '',
    mensaje: '',
  })
  const [formRespuestaMensaje, setFormRespuestaMensaje] = useState({
    respuesta: '',
  })

  const usuariosPorPagina = 5

  const cargarAlertas = async () => {
    setCargandoAlertas(true)

    try {
      const res = await getAlertas()
      const alertasRecibidas = res.data || []
      setAlertas(alertasRecibidas.filter((alerta) => alerta.activa !== false))
    } catch (error) {
      console.error(error)
      setAlertas([])
      showToast('No se pudieron cargar las alertas', 'error')
    } finally {
      setCargandoAlertas(false)
    }
  }

  useEffect(() => {
    cargarAlertas()
  }, [])

  const cerrarSesion = () => {
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const cargarUsuarios = async () => {
    try {
      const res = await getUsuarios()
      setUsuarios(res.data || [])
      setPaginaUsuarios(1)
    } catch (error) {
      console.error(error)
      setUsuarios([])
      showToast('No se pudieron cargar los usuarios', 'error')
    }
  }

  const handleNuevoUsuarioChange = (e) => {
    setNuevoUsuario({
      ...nuevoUsuario,
      [e.target.name]: e.target.value,
    })
  }

  const guardarNuevoUsuario = async (e) => {
    e.preventDefault()

    if (!nuevoUsuario.nombre.trim()) {
      showToast('El nombre es obligatorio', 'warning')
      return
    }

    if (!nuevoUsuario.apellidos.trim()) {
      showToast('Los apellidos son obligatorios', 'warning')
      return
    }

    if (!nuevoUsuario.email.trim()) {
      showToast('El email es obligatorio', 'warning')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoUsuario.email)) {
      showToast('Introduce un email válido', 'warning')
      return
    }

    if (nuevoUsuario.password.length < 8 || !/[0-9]/.test(nuevoUsuario.password)) {
      showToast('La contraseña debe tener mínimo 8 caracteres y 1 número', 'warning')
      return
    }

    try {
      const resUsuarios = await getUsuarios()
      const usuariosExistentes = resUsuarios.data || []

      const emailExiste = usuariosExistentes.some((usuario) =>
        String(usuario.email || '').toLowerCase().trim() ===
        String(nuevoUsuario.email || '').toLowerCase().trim(),
      )

      if (emailExiste) {
        showToast('Ya existe un usuario con ese email', 'warning')
        return
      }

      await createUsuario({
        nombre: nuevoUsuario.nombre.trim(),
        apellidos: nuevoUsuario.apellidos.trim(),
        email: nuevoUsuario.email.trim(),
        password: nuevoUsuario.password,
        rol: nuevoUsuario.rol,
      })

      setNuevoUsuario({
        nombre: '',
        apellidos: '',
        email: '',
        password: '',
        rol: 'medico',
      })

      await cargarUsuarios()
      showToast('Usuario creado correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo crear el usuario', 'error')
    }
  }

  const seleccionarUsuario = (usuario) => {
    setUsuarioSeleccionado(usuario)
    setMostrarConfirmacionEliminar(false)
  }

  const eliminarUsuarioSeleccionado = async () => {
    if (!usuarioSeleccionado) return

    const idUsuarioEliminar =
      usuarioSeleccionado.id ??
      usuarioSeleccionado.idUsuario

    if (Number(idUsuarioEliminar) === Number(idUsuarioLogeado)) {
      showToast('No puedes eliminar tu propio usuario', 'warning')
      return
    }

    setEliminandoUsuario(true)

    try {
      await deleteUsuario(idUsuarioEliminar)

      setUsuarios((prev) =>
        prev.filter(
          (usuario) =>
            Number(usuario.id ?? usuario.idUsuario) !==
            Number(idUsuarioEliminar),
        ),
      )

      setMostrarConfirmacionEliminar(false)
      setUsuarioSeleccionado(null)
      showToast('Usuario eliminado correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo eliminar el usuario', 'error')
    } finally {
      setEliminandoUsuario(false)
    }
  }

  const handleAlertaChange = (e) => {
    setFormAlerta({
      ...formAlerta,
      [e.target.name]: e.target.value,
    })
  }

  const limpiarFormularioAlerta = () => {
    setFormAlerta({
      tipo: 'Info',
      titulo: '',
      texto: '',
      activa: true,
    })
    setAlertaEditando(null)
  }

  const guardarAlerta = async (e) => {
    e.preventDefault()

    if (!formAlerta.tipo.trim()) {
      showToast('El tipo de alerta es obligatorio', 'warning')
      return
    }

    if (!formAlerta.titulo.trim()) {
      showToast('El título de la alerta es obligatorio', 'warning')
      return
    }

    if (!formAlerta.texto.trim()) {
      showToast('El texto de la alerta es obligatorio', 'warning')
      return
    }

    if (formAlerta.texto.trim().length < 5) {
      showToast('La alerta debe tener al menos 5 caracteres', 'warning')
      return
    }

    const alertaGuardada = {
      tipo: formAlerta.tipo.trim(),
      titulo: formAlerta.titulo.trim(),
      texto: formAlerta.texto.trim(),
      activa: true,
    }

    try {
      if (alertaEditando) {
        const id = alertaEditando.id ?? alertaEditando.idAlerta
        await updateAlerta(id, alertaGuardada)
        showToast('Alerta modificada correctamente', 'success')
      } else {
        await createAlerta(alertaGuardada)
        showToast('Alerta añadida correctamente', 'success')
      }

      limpiarFormularioAlerta()
      await cargarAlertas()
    } catch (error) {
      console.error(error)
      showToast('No se pudo guardar la alerta', 'error')
    }
  }

  const editarAlerta = (alerta) => {
    setFormAlerta({
      tipo: alerta.tipo || 'Info',
      titulo: alerta.titulo || '',
      texto: alerta.texto || '',
      activa: alerta.activa !== false,
    })
    setAlertaEditando(alerta)
  }

  const eliminarAlerta = async (alerta) => {
    const id = alerta.id ?? alerta.idAlerta

    try {
      await deleteAlerta(id)
      await cargarAlertas()

      if (alertaEditando && Number(alertaEditando.id ?? alertaEditando.idAlerta) === Number(id)) {
        limpiarFormularioAlerta()
      }

      showToast('Alerta eliminada correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo eliminar la alerta', 'error')
    }
  }


  const cargarMensajesContacto = async (avisarNoLeidos = false) => {
    setCargandoMensajes(true)

    try {
      const res = await getMensajesContacto()
      const mensajesRecibidos = res.data || []
      setMensajesContacto(mensajesRecibidos)

      const totalNoLeidos = mensajesRecibidos.filter((mensaje) => !mensaje.leido).length

      if (avisarNoLeidos && totalNoLeidos > 0) {
        showToast(`Tienes ${totalNoLeidos} mensaje(s) sin leer`, 'warning')
      }
    } catch (error) {
      console.error(error)
      setMensajesContacto([])
      showToast('No se pudieron cargar los mensajes', 'error')
    } finally {
      setCargandoMensajes(false)
    }
  }

  useEffect(() => {
    if (esAdmin) {
      cargarMensajesContacto(true)
    }
  }, [esAdmin])

  const handleMensajeContactoChange = (e) => {
    setFormMensajeContacto({
      ...formMensajeContacto,
      [e.target.name]: e.target.value,
    })
  }

  const enviarMensajeContacto = async (e) => {
    e.preventDefault()

    if (!formMensajeContacto.asunto.trim()) {
      showToast('El asunto es obligatorio', 'warning')
      return
    }

    if (!formMensajeContacto.mensaje.trim()) {
      showToast('El mensaje es obligatorio', 'warning')
      return
    }

    if (formMensajeContacto.mensaje.trim().length < 5) {
      showToast('El mensaje debe tener al menos 5 caracteres', 'warning')
      return
    }

    try {
      await createMensajeContacto({
        idUsuario: idUsuarioLogeado ? Number(idUsuarioLogeado) : null,
        nombre: `${usuarioLogeado?.nombre || ''} ${usuarioLogeado?.apellidos || ''}`.trim() || 'Usuario',
        email: usuarioLogeado?.email || '',
        asunto: formMensajeContacto.asunto.trim(),
        mensaje: formMensajeContacto.mensaje.trim(),
        leido: false,
      })

      setFormMensajeContacto({
        asunto: '',
        mensaje: '',
      })

      showToast('Mensaje enviado al administrador', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo enviar el mensaje', 'error')
    }
  }

  const seleccionarMensajeContacto = async (mensaje) => {
    setMensajeSeleccionado(mensaje)
    setFormRespuestaMensaje({
      respuesta: mensaje.respuesta || '',
    })

    const id = mensaje.id ?? mensaje.idMensaje

    if (!mensaje.leido && id) {
      try {
        await marcarMensajeComoLeido(id)
        setMensajesContacto((prev) =>
          prev.map((item) =>
            Number(item.id ?? item.idMensaje) === Number(id)
              ? { ...item, leido: true }
              : item,
          ),
        )
      } catch (error) {
        console.error(error)
      }
    }
  }

  const eliminarMensajeContacto = async (mensaje) => {
    const id = mensaje.id ?? mensaje.idMensaje

    try {
      await deleteMensajeContacto(id)
      setMensajesContacto((prev) =>
        prev.filter((item) => Number(item.id ?? item.idMensaje) !== Number(id)),
      )
      setMensajeSeleccionado(null)
      showToast('Mensaje eliminado correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo eliminar el mensaje', 'error')
    }
  }

  const handleRespuestaMensajeChange = (e) => {
    setFormRespuestaMensaje({
      ...formRespuestaMensaje,
      [e.target.name]: e.target.value,
    })
  }

  const responderMensajeSeleccionado = async (e) => {
    e.preventDefault()

    if (!mensajeSeleccionado) return

    if (!formRespuestaMensaje.respuesta.trim()) {
      showToast('La respuesta no puede estar vacía', 'warning')
      return
    }

    if (formRespuestaMensaje.respuesta.trim().length < 5) {
      showToast('La respuesta debe tener al menos 5 caracteres', 'warning')
      return
    }

    const id = mensajeSeleccionado.id ?? mensajeSeleccionado.idMensaje

    try {
      const res = await responderMensajeContacto(id, {
        respuesta: formRespuestaMensaje.respuesta.trim(),
      })

      const mensajeActualizado = res.data || {
        ...mensajeSeleccionado,
        respuesta: formRespuestaMensaje.respuesta.trim(),
        fechaRespuesta: new Date().toISOString(),
        leido: true,
      }

      setMensajeSeleccionado(mensajeActualizado)
      setMensajesContacto((prev) =>
        prev.map((item) =>
          Number(item.id ?? item.idMensaje) === Number(id)
            ? mensajeActualizado
            : item,
        ),
      )
      setFormRespuestaMensaje({
        respuesta: mensajeActualizado.respuesta || '',
      })
      showToast('Respuesta enviada correctamente', 'success')
    } catch (error) {
      console.error(error)
      showToast('No se pudo responder el mensaje', 'error')
    }
  }

  const formatearFechaMensaje = (fecha) => {
    if (!fecha) return 'Sin fecha'

    return new Date(fecha).toLocaleString('es-ES')
  }

  const mensajesNoLeidos = mensajesContacto.filter((mensaje) => !mensaje.leido).length

  const totalPaginasUsuarios = Math.max(1, Math.ceil(usuarios.length / usuariosPorPagina))

  const usuariosPagina = useMemo(() => {
    const inicio = (paginaUsuarios - 1) * usuariosPorPagina
    const fin = inicio + usuariosPorPagina

    return usuarios.slice(inicio, fin)
  }, [usuarios, paginaUsuarios])

  return (
    <>
      <header className="header-custom">
        <nav className="header-nav">
          <div className="header-item">
            <Link to="/gestion-citas" className="header-link">
              Gestionar Citas ↓
            </Link>

            <ul className="custom-dropdown">
              <li><Link to="/citas">Ver citas</Link></li>
              <li><Link to="/citas/nueva">Añadir citas</Link></li>
              <li><Link to="/citas/eliminar">Eliminar citas</Link></li>
            </ul>
          </div>

          <div className="header-item">
            <Link to="/gestion-pacientes" className="header-link">
              Gestionar Pacientes ↓
            </Link>

            <ul className="custom-dropdown">
              <li><Link to="/pacientes">Ver Pacientes</Link></li>
              <li><Link to="/pacientes/nuevo">Añadir Pacientes</Link></li>
              <li><Link to="/pacientes/eliminar">Eliminar Pacientes</Link></li>
            </ul>
          </div>

          <div className="header-item">
            <Link to="/horario" className="header-link">
              Consultar tu horario
            </Link>
          </div>
        </nav>

        <div className="header-alertas">
          <button
            type="button"
            className="alertas-header-btn"
            data-bs-toggle="modal"
            data-bs-target="#alertasHeaderModal"
            title="Alertas internas"
          >
            ⚠
            <span>{alertas.length}</span>
          </button>
        </div>

        <div className="header-user">
          <img
            src="/img/perfil.png"
            alt="Perfil"
            className="perfil-icon perfil-clickable"
            data-bs-toggle="modal"
            data-bs-target="#usuarioModal"
          />

          <div className="user-menu-wrapper">
            <button className="user-button" type="button">
              Bienvenido, {usuarioLogeado?.nombre || 'Usuario'} ▾
            </button>

            <ul className="user-menu">
              <li>
                <button type="button" onClick={cerrarSesion}>
                  Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="modal fade" id="alertasHeaderModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content alertas-modal-content">
            <div className="modal-header alertas-modal-header">
              <h5 className="modal-title">
                Alertas internas del sanitario
              </h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body alertas-modal-body">
              {cargandoAlertas ? (
                <p className="alertas-vacias">
                  Cargando alertas internas...
                </p>
              ) : alertas.length === 0 ? (
                <p className="alertas-vacias">
                  No hay alertas internas registradas.
                </p>
              ) : (
                alertas.map((alerta) => (
                  <div key={alerta.id ?? alerta.idAlerta} className="alerta-modal-item alerta-modal-item-admin">
                    <div>
                      <span>{alerta.tipo}</span>
                      {alerta.titulo && <strong className="alerta-titulo">{alerta.titulo}</strong>}
                      <p>{alerta.texto}</p>
                    </div>

                    {esAdmin && (
                      <div className="alerta-admin-actions">
                        <button
                          type="button"
                          className="btn-alerta-editar"
                          onClick={() => editarAlerta(alerta)}
                        >
                          Modificar
                        </button>

                        <button
                          type="button"
                          className="btn-alerta-eliminar"
                          onClick={() => eliminarAlerta(alerta)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}

              {esAdmin && (
                <form className="alerta-admin-form" onSubmit={guardarAlerta}>
                  <h6>
                    {alertaEditando
                      ? 'Modificar alerta interna'
                      : 'Añadir alerta interna'}
                  </h6>

                  <label>Tipo:</label>
                  <select
                    name="tipo"
                    value={formAlerta.tipo}
                    onChange={handleAlertaChange}
                  >
                    <option value="Urgente">Urgente</option>
                    <option value="Sanitaria">Sanitaria</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Info">Info</option>
                  </select>

                  <label>Título:</label>
                  <input
                    type="text"
                    name="titulo"
                    maxLength="100"
                    value={formAlerta.titulo}
                    onChange={handleAlertaChange}
                    placeholder="Título de la alerta"
                  />

                  <label>Texto:</label>
                  <textarea
                    name="texto"
                    rows="3"
                    maxLength="500"
                    value={formAlerta.texto}
                    onChange={handleAlertaChange}
                    placeholder="Escribe el texto de la alerta"
                  />

                  <div className="alerta-admin-form-actions">
                    {alertaEditando && (
                      <button
                        type="button"
                        className="btn-alerta-cancelar"
                        onClick={limpiarFormularioAlerta}
                      >
                        Cancelar
                      </button>
                    )}

                    <button type="submit" className="btn-alerta-guardar">
                      {alertaEditando ? 'Guardar cambios' : 'Añadir alerta'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="usuarioModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content usuario-modal-content">
            <div className="modal-header usuario-modal-header">
              <h5 className="modal-title">Datos del usuario</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              <img
                src="/img/perfil.png"
                alt="Perfil"
                className="usuario-modal-img"
              />

              <div className="usuario-dato">
                <strong>ID:</strong>
                <span>{usuarioLogeado?.id || usuarioLogeado?.idUsuario || 'No disponible'}</span>
              </div>

              <div className="usuario-dato">
                <strong>Nombre:</strong>
                <span>{usuarioLogeado?.nombre || 'No disponible'}</span>
              </div>

              <div className="usuario-dato">
                <strong>Apellidos:</strong>
                <span>{usuarioLogeado?.apellidos || 'No disponible'}</span>
              </div>

              <div className="usuario-dato">
                <strong>Email:</strong>
                <span>{usuarioLogeado?.email || 'No disponible'}</span>
              </div>

              <div className="usuario-dato">
                <strong>Rol:</strong>
                <span>{usuarioLogeado?.rol || 'No disponible'}</span>
              </div>

              {esAdmin && (
                <div className="admin-actions admin-actions-multiple">
                  <button
                    type="button"
                    className="btn-admin-usuario"
                    data-bs-toggle="modal"
                    data-bs-target="#nuevoUsuarioModal"
                  >
                    + Añadir usuario
                  </button>

                  <button
                    type="button"
                    className="btn-admin-usuario"
                    data-bs-toggle="modal"
                    data-bs-target="#usuariosExistentesModal"
                    onClick={cargarUsuarios}
                  >
                    Ver usuarios
                  </button>

                  <button
                    type="button"
                    className={`btn-admin-usuario btn-ver-mensajes-admin ${mensajesNoLeidos > 0 ? 'btn-mensajes-pendientes' : ''}`}
                    data-bs-toggle="modal"
                    data-bs-target="#mensajesContactoModal"
                    onClick={() => cargarMensajesContacto(false)}
                  >
                    {mensajesNoLeidos > 0 ? `Ver mensajes (${mensajesNoLeidos} sin leer)` : 'Ver mensajes'}
                  </button>
                </div>
              )}

              {!esAdmin && (
                <div className="admin-actions admin-actions-multiple">
                  <button
                    type="button"
                    className="btn-admin-usuario btn-ver-alertas-usuario"
                    data-bs-toggle="modal"
                    data-bs-target="#alertasHeaderModal"
                  >
                    Ver alertas internas
                  </button>

                  <button
                    type="button"
                    className="btn-admin-usuario btn-mensaje-admin"
                    data-bs-toggle="modal"
                    data-bs-target="#enviarMensajeAdminModal"
                  >
                    Enviar mensaje al admin
                  </button>

                  <button
                    type="button"
                    className="btn-admin-usuario btn-ver-mensajes-usuario"
                    data-bs-toggle="modal"
                    data-bs-target="#misMensajesUsuarioModal"
                    onClick={() => cargarMensajesContacto(false)}
                  >
                    Mis mensajes
                  </button>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="nuevoUsuarioModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content usuario-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#usuarioModal"
                title="Volver a datos del usuario"
              >
                ←
              </button>

              <h5 className="modal-title">Añadir nuevo usuario</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              <form className="nuevo-usuario-form" onSubmit={guardarNuevoUsuario}>
                <label>Nombre:</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Introduce el nombre"
                  value={nuevoUsuario.nombre}
                  onChange={handleNuevoUsuarioChange}
                />

                <label>Apellidos:</label>
                <input
                  type="text"
                  name="apellidos"
                  placeholder="Introduce los apellidos"
                  value={nuevoUsuario.apellidos}
                  onChange={handleNuevoUsuarioChange}
                />

                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Introduce el email"
                  value={nuevoUsuario.email}
                  onChange={handleNuevoUsuarioChange}
                />

                <label>Contraseña:</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Mínimo 8 caracteres y 1 número"
                  value={nuevoUsuario.password}
                  onChange={handleNuevoUsuarioChange}
                />

                <label>Rol:</label>
                <select
                  name="rol"
                  value={nuevoUsuario.rol}
                  onChange={handleNuevoUsuarioChange}
                >
                  <option value="medico">Médico</option>
                  <option value="admin">Admin</option>
                </select>

                <button type="submit" className="btn-admin-usuario">
                  Guardar usuario
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="usuariosExistentesModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content usuario-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#usuarioModal"
                title="Volver a datos del usuario"
              >
                ←
              </button>

              <h5 className="modal-title">Usuarios existentes</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              <div className="usuarios-admin-table-wrapper">
                <table className="table table-bordered usuarios-admin-table">
                  <thead className="table-dark">
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosPagina.length === 0 ? (
                      <tr>
                        <td colSpan="3">No hay usuarios registrados</td>
                      </tr>
                    ) : (
                      usuariosPagina.map((usuario) => (
                        <tr
                          key={usuario.id ?? usuario.idUsuario}
                          className="fila-usuario-admin"
                          data-bs-toggle="modal"
                          data-bs-target="#detalleUsuarioAdminModal"
                          onClick={() => seleccionarUsuario(usuario)}
                        >
                          <td>{usuario.nombre} {usuario.apellidos}</td>
                          <td>{usuario.email}</td>
                          <td>{usuario.rol}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="paginacion-admin-usuarios">
                <button
                  type="button"
                  disabled={paginaUsuarios === 1}
                  onClick={() => setPaginaUsuarios((prev) => prev - 1)}
                >
                  Anterior
                </button>

                <span>
                  Página
                  {' '}
                  <select
                    value={paginaUsuarios}
                    onChange={(e) => setPaginaUsuarios(Number(e.target.value))}
                  >
                    {Array.from({ length: totalPaginasUsuarios }, (_, index) => (
                      <option key={index + 1} value={index + 1}>
                        {index + 1}
                      </option>
                    ))}
                  </select>
                  {' '}
                  de {totalPaginasUsuarios}
                </span>

                <button
                  type="button"
                  disabled={paginaUsuarios === totalPaginasUsuarios}
                  onClick={() => setPaginaUsuarios((prev) => prev + 1)}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="detalleUsuarioAdminModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content usuario-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#usuariosExistentesModal"
                title="Volver a usuarios existentes"
              >
                ←
              </button>

              <h5 className="modal-title">Detalle del usuario</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              {usuarioSeleccionado ? (
                <>
                  <img
                    src="/img/perfil.png"
                    alt="Perfil"
                    className="usuario-modal-img"
                  />

                  <div className="usuario-dato">
                    <strong>ID:</strong>
                    <span>{usuarioSeleccionado.id ?? usuarioSeleccionado.idUsuario}</span>
                  </div>

                  <div className="usuario-dato">
                    <strong>Nombre:</strong>
                    <span>{usuarioSeleccionado.nombre || 'No disponible'}</span>
                  </div>

                  <div className="usuario-dato">
                    <strong>Apellidos:</strong>
                    <span>{usuarioSeleccionado.apellidos || 'No disponible'}</span>
                  </div>

                  <div className="usuario-dato">
                    <strong>Email:</strong>
                    <span>{usuarioSeleccionado.email || 'No disponible'}</span>
                  </div>

                  <div className="usuario-dato">
                    <strong>Rol:</strong>
                    <span>{usuarioSeleccionado.rol || 'No disponible'}</span>
                  </div>

                  <div className="admin-actions">
                    {esUsuarioActual(usuarioSeleccionado) ? (
                      <button
                        type="button"
                        className="btn-eliminar-usuario-admin btn-eliminar-usuario-disabled"
                        disabled
                        title="No puedes eliminar tu propio usuario"
                      >
                        No puedes eliminar tu propio usuario
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-eliminar-usuario-admin"
                        onClick={() => setMostrarConfirmacionEliminar(true)}
                      >
                        Eliminar usuario
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <p>No se ha seleccionado ningún usuario.</p>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="enviarMensajeAdminModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content usuario-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#usuarioModal"
                title="Volver a datos del usuario"
              >
                ←
              </button>

              <h5 className="modal-title">Enviar mensaje al administrador</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              <form className="mensaje-admin-form" onSubmit={enviarMensajeContacto}>
                <label>Asunto:</label>
                <input
                  type="text"
                  name="asunto"
                  maxLength="150"
                  value={formMensajeContacto.asunto}
                  onChange={handleMensajeContactoChange}
                  placeholder="Ej: Problema con una cita"
                />

                <label>Mensaje:</label>
                <textarea
                  name="mensaje"
                  rows="5"
                  value={formMensajeContacto.mensaje}
                  onChange={handleMensajeContactoChange}
                  placeholder="Escribe el mensaje para el administrador"
                />

                <button type="submit" className="btn-admin-usuario">
                  Enviar mensaje
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="mensajesContactoModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content usuario-modal-content mensajes-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#usuarioModal"
                title="Volver a datos del usuario"
              >
                ←
              </button>

              <h5 className="modal-title">Mensajes recibidos</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              {cargandoMensajes ? (
                <p className="alertas-vacias">Cargando mensajes...</p>
              ) : mensajesContacto.length === 0 ? (
                <p className="alertas-vacias">No hay mensajes recibidos.</p>
              ) : (
                <div className="mensajes-admin-lista">
                  {mensajesContacto.map((mensaje) => (
                    <button
                      key={mensaje.id ?? mensaje.idMensaje}
                      type="button"
                      className={`mensaje-admin-item ${mensaje.leido ? 'mensaje-leido' : 'mensaje-no-leido'}`}
                      data-bs-toggle="modal"
                      data-bs-target="#detalleMensajeContactoModal"
                      onClick={() => seleccionarMensajeContacto(mensaje)}
                    >
                      <span className="mensaje-admin-asunto">
                        {!mensaje.leido && <strong className="mensaje-punto">●</strong>}
                        {mensaje.asunto || 'Sin asunto'}
                      </span>

                      <span>{mensaje.nombre || 'Usuario'}</span>
                      <small>{formatearFechaMensaje(mensaje.fechaEnvio)}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade" id="detalleMensajeContactoModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content usuario-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#mensajesContactoModal"
                title="Volver a mensajes"
              >
                ←
              </button>

              <h5 className="modal-title">Detalle del mensaje</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              {mensajeSeleccionado ? (
                <>
                  <div className="usuario-dato">
                    <strong>De:</strong>
                    <span>{mensajeSeleccionado.nombre || 'Usuario'}</span>
                  </div>

                  <div className="usuario-dato">
                    <strong>Email:</strong>
                    <span>{mensajeSeleccionado.email || 'No disponible'}</span>
                  </div>

                  <div className="usuario-dato">
                    <strong>Fecha:</strong>
                    <span>{formatearFechaMensaje(mensajeSeleccionado.fechaEnvio)}</span>
                  </div>

                  <div className="mensaje-detalle-box">
                    <strong>{mensajeSeleccionado.asunto || 'Sin asunto'}</strong>
                    <p>{mensajeSeleccionado.mensaje || 'Sin mensaje'}</p>
                  </div>

                  {mensajeSeleccionado.respuesta && (
                    <div className="mensaje-respuesta-box">
                      <strong>Respuesta enviada:</strong>
                      <p>{mensajeSeleccionado.respuesta}</p>

                      {mensajeSeleccionado.fechaRespuesta && (
                        <small>
                          Respondido el {formatearFechaMensaje(mensajeSeleccionado.fechaRespuesta)}
                        </small>
                      )}
                    </div>
                  )}

                  <form className="respuesta-admin-form" onSubmit={responderMensajeSeleccionado}>
                    <label>
                      {mensajeSeleccionado.respuesta ? 'Modificar respuesta:' : 'Responder al usuario:'}
                    </label>

                    <textarea
                      name="respuesta"
                      rows="4"
                      value={formRespuestaMensaje.respuesta}
                      onChange={handleRespuestaMensajeChange}
                      placeholder="Escribe la respuesta para el usuario"
                    />

                    <button type="submit" className="btn-admin-usuario btn-responder-mensaje">
                      {mensajeSeleccionado.respuesta ? 'Actualizar respuesta' : 'Enviar respuesta'}
                    </button>
                  </form>

                  <div className="admin-actions admin-actions-multiple">
                    <button
                      type="button"
                      className="btn-eliminar-usuario-admin"
                      onClick={() => eliminarMensajeContacto(mensajeSeleccionado)}
                    >
                      Eliminar mensaje
                    </button>
                  </div>
                </>
              ) : (
                <p>No se ha seleccionado ningún mensaje.</p>
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="misMensajesUsuarioModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content usuario-modal-content mensajes-modal-content">
            <div className="modal-header usuario-modal-header modal-header-con-volver">
              <button
                type="button"
                className="btn-modal-volver"
                data-bs-toggle="modal"
                data-bs-target="#usuarioModal"
                title="Volver a datos del usuario"
              >
                ←
              </button>

              <h5 className="modal-title">Mis mensajes</h5>

              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>

            <div className="modal-body usuario-modal-body">
              {cargandoMensajes ? (
                <p className="alertas-vacias">Cargando mensajes...</p>
              ) : mensajesContacto.filter(
                (mensaje) => Number(mensaje.idUsuario) === Number(idUsuarioLogeado),
              ).length === 0 ? (
                <p className="alertas-vacias">
                  No has enviado mensajes todavía.
                </p>
              ) : (
                <div className="mensajes-admin-lista">
                  {mensajesContacto
                    .filter(
                      (mensaje) => Number(mensaje.idUsuario) === Number(idUsuarioLogeado),
                    )
                    .map((mensaje) => (
                      <div
                        key={mensaje.id ?? mensaje.idMensaje}
                        className="mensaje-usuario-item"
                      >
                        <div className="mensaje-usuario-header">
                          <strong>{mensaje.asunto || 'Sin asunto'}</strong>

                          {mensaje.respuesta ? (
                            <span className="badge bg-success">
                              Respondido
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">
                              Pendiente
                            </span>
                          )}
                        </div>

                        <div className="mensaje-usuario-body">
                          <small>
                            Enviado el {formatearFechaMensaje(mensaje.fechaEnvio)}
                          </small>

                          <p>
                            <strong>Mensaje:</strong>
                          </p>

                          <p>{mensaje.mensaje || 'Sin mensaje'}</p>

                          {mensaje.respuesta && (
                            <>
                              <hr />

                              <p>
                                <strong>Respuesta del administrador:</strong>
                              </p>

                              <div className="respuesta-admin-box">
                                {mensaje.respuesta}
                              </div>

                              {mensaje.fechaRespuesta && (
                                <small>
                                  Respondido el {formatearFechaMensaje(mensaje.fechaRespuesta)}
                                </small>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mostrarConfirmacionEliminar && (
        <div className="confirmacion-eliminar-overlay">
          <div className="confirmacion-eliminar-modal">
            <div className="confirmacion-eliminar-header">
              <h5>Confirmar eliminación</h5>

              <button
                type="button"
                className="btn-confirmacion-cerrar"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                ×
              </button>
            </div>

            <div className="confirmacion-eliminar-body">
              <p>
                ¿Seguro que deseas eliminar este usuario?
              </p>

              <strong>
                {usuarioSeleccionado?.nombre}{' '}
                {usuarioSeleccionado?.apellidos}
              </strong>

              <span>
                Esta acción no se puede deshacer.
              </span>
            </div>

            <div className="confirmacion-eliminar-actions">
              <button
                type="button"
                className="btn-confirmacion-cancelar"
                onClick={() => setMostrarConfirmacionEliminar(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn-eliminar-usuario-admin"
                disabled={eliminandoUsuario}
                onClick={eliminarUsuarioSeleccionado}
              >
                {eliminandoUsuario ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StaffHeader
