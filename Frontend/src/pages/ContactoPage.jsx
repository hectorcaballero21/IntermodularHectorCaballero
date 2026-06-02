import { Link } from 'react-router-dom'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/contacto.css'

function ContactoPage() {
  return (
    <>
      <Link to={localStorage.getItem('usuario') ? '/area-personal' : '/'}>
        <img
          src="/img/logosescam.png"
          alt="Logo SESCAM"
          className="logo-sescam-contacto"
        />
      </Link>

      <div className="container contacto-box bg-white p-4 rounded shadow position-absolute">
        <p className="fs-3 fw-bold text-center mb-4">
          Si desea contactar con el centro o administrador del centro para cualquier gestión como cambio de credenciales, concretar una cita, solicitar datos, etc, contacte con el centro a través de:
        </p>

        <div className="d-flex align-items-center fs-3 mb-3">
          <img
            src="/img/llamada.png"
            alt="Teléfono"
            className="me-3"
            style={{ width: '40px' }}
          />

          <span>926646000</span>
        </div>

        <div className="d-flex align-items-center fs-3 mb-4">
          <img
            src="/img/mail.png"
            alt="Email"
            className="me-3"
            style={{ width: '40px' }}
          />

          <span>administracion@hospitaltagr.com</span>
        </div>

        <p className="text-center fs-4 mt-4 fw-semibold">
          Gracias por su confianza
        </p>
      </div>

      <PublicFooter />
    </>
  )
}

export default ContactoPage