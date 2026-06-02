import { Link } from 'react-router-dom'
import StaffHeader from '../components/StaffHeader'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/gestionCitas.css'

function GestionCitasPage() {
  return (
    <>
      <StaffHeader />

      <img
        src="/img/logosescam.png"
        alt="Logo SESCAM"
        className="logo-sescam-gestion-citas"
      />

      <div className="contenedor-botones">
        <Link to="/citas" className="boton-opcion">
          <img src="/img/reloj.png" className="icono" alt="Icono Ver Citas" />
          Ver Citas
        </Link>

        <Link to="/citas/nueva" className="boton-opcion">
          <img src="/img/agregarcita.png" className="icono" alt="Icono Añadir Citas" />
          Añadir Citas
        </Link>

        <Link to="/citas/eliminar" className="boton-opcion">
          <img src="/img/eliminar.png" className="icono" alt="Icono Eliminar Citas" />
          Eliminar Citas
        </Link>
      </div>

      <PublicFooter />
    </>
  )
}

export default GestionCitasPage