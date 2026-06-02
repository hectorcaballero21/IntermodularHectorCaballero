import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import '../assets/css/login.css'
import PublicFooter from '../components/PublicFooter'
import LegalModals from '../components/LegalModals'
import { getUsuarios } from '../services/usuarioService'
import { useToast } from '../context/ToastContext'

function LoginPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState({})

  const validarFormulario = () => {
    const nuevosErrores = {}

    if (!usuario.trim()) {
      nuevosErrores.usuario = 'El usuario o email es obligatorio'
    }

    if (!contrasena.trim()) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria'
    } else if (contrasena.length < 8 || !/[0-9]/.test(contrasena)) {
      nuevosErrores.contrasena = 'La contraseña debe tener mínimo 8 caracteres y 1 número'
    }

    setErrores(nuevosErrores)

    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      showToast('Revisa los campos del formulario', 'warning')
      return
    }

    try {
      const res = await getUsuarios()
      const usuarios = res.data

      const usuarioEncontrado = usuarios.find((u) => {
        const usuarioInput = usuario.trim().toLowerCase()

        return (
          String(u.email || '').toLowerCase() === usuarioInput ||
          String(u.nombre || '').toLowerCase() === usuarioInput
        ) && String(u.password) === String(contrasena)
      })

      if (!usuarioEncontrado) {
        showToast('Usuario o contraseña incorrectos', 'error')
        return
      }

      localStorage.setItem('usuario', JSON.stringify(usuarioEncontrado))
      showToast(`Bienvenido, ${usuarioEncontrado.nombre}`, 'success')
      navigate('/area-personal')
    } catch (err) {
      console.error(err)
      showToast('No se pudo conectar con el servidor', 'error')
    }
  }

  return (
    <>
      <img src="/img/logosescam.png" alt="Logo SESCAM" className="logo-sescam" />

      <div className="login-box">
        <h2>Iniciar Sesión</h2>

        <p className="login-info">
          NOTA: Si tu usuario no aparece, contacta con el administrador del centro.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label">
              Usuario
            </label>

            <input
              id="usuario"
              type="text"
              className={errores.usuario ? 'error-input' : ''}
              placeholder="Introduce tu usuario o email"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value)
                setErrores({ ...errores, usuario: '' })
              }}
            />

            {errores.usuario && (
              <p className="error-text">{errores.usuario}</p>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="contrasena" className="form-label">
              Contraseña
            </label>

            <input
              id="contrasena"
              type="password"
              className={errores.contrasena ? 'error-input' : ''}
              placeholder="Introduce tu contraseña"
              value={contrasena}
              onChange={(e) => {
                setContrasena(e.target.value)
                setErrores({ ...errores, contrasena: '' })
              }}
            />

            {errores.contrasena && (
              <p className="error-text">{errores.contrasena}</p>
            )}
          </div>

          <button type="submit" className="btn btn-dark w-100 mt-2">
            Entrar
          </button>
        </form>
      </div>

      <PublicFooter />
      <LegalModals />
    </>
  )
}

export default LoginPage