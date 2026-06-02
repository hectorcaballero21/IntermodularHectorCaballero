import { Link } from 'react-router-dom'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/nosotros.css'

function NosotrosPage() {
  return (
    <>
      <Link to={localStorage.getItem('usuario') ? '/area-personal' : '/'}>
        <img
          src="/img/logosescam.png"
          alt="Logo SESCAM"
          className="logo-sescam-nosotros"
        />
      </Link>

      <div className="container nosotros-box bg-white p-4 rounded shadow position-absolute">
        <p className="fs-3 fw-bold text-center mb-3">
          El Hospital Virgen de Altagracia de Manzanares es un centro sanitario de referencia perteneciente al Servicio de Salud de Castilla-La Mancha (SESCAM).
        </p>

        <p className="fs-4 text-center">
          Comprometido con la calidad asistencial, la humanización de los cuidados y la mejora continua, ofrece una atención integral a los ciudadanos de Manzanares y su área de influencia.
        </p>

        <p className="fs-4 text-center">
          Su equipo multidisciplinar trabaja cada día para garantizar un servicio cercano, eficiente y basado en la innovación, combinando la experiencia profesional con los más avanzados recursos tecnológicos.
        </p>

        <p className="fs-4 text-center fw-semibold">
          Además, el hospital impulsa la docencia y la investigación como pilares fundamentales para el progreso y la excelencia en la atención sanitaria.
        </p>
      </div>

      <PublicFooter />
    </>
  )
}

export default NosotrosPage