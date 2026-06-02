import { Link } from 'react-router-dom'
import '../assets/css/index.css'
import PublicFooter from '../components/PublicFooter'
import LegalModals from '../components/LegalModals'

function HomePage() {
  return (
    <>
      <img src="/img/logosescam.png" alt="Logo SESCAM" className="logo-sescam" />

      <div className="mensaje text-center">
        Identifícate como profesional del centro para poder acceder a la web
      </div>

      <Link to="/login" className="boton-login">
        <span className="txt">Iniciar Sesión</span>
        <img src="/img/acceso.png" alt="Icono acceso" className="imgac" />
      </Link>

      <PublicFooter withToggle withMenuButton />
      <LegalModals />
    </>
  )
}

export default HomePage
