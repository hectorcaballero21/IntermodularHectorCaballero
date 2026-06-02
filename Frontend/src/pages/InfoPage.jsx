import { Link } from 'react-router-dom'
import PublicFooter from '../components/PublicFooter'
import '../assets/css/info.css'

function InfoPage() {
  return (
    <>
      <main>
        <Link to={localStorage.getItem('usuario') ? '/area-personal' : '/'}>
          <img
            src="/img/logosescam.png"
            alt="Logo SESCAM"
            className="logo-sescam-info"
          />
        </Link>

        <div className="container info-box bg-white rounded shadow position-absolute d-flex flex-column flex-lg-row align-items-start p-4">
          <div className="info-text me-lg-4 mb-4 mb-lg-0">
            <h2 className="fw-bold mb-3">HOSPITAL</h2>

            <p id="espacio">a</p>

            <p className="fs-4 mb-2">
              <strong>Dirección:</strong> AVDA D. EMILIANO GARCIA ROLDAN, 2
            </p>

            <p className="fs-4 mb-2">
              <strong>Código Postal:</strong> 13200
            </p>

            <p className="fs-4 mb-2">
              <strong>Localidad:</strong> MANZANARES
            </p>

            <p className="fs-4 mb-2">
              <strong>Teléfono centralita:</strong> 926646000
            </p>
          </div>

          <div className="info-map flex-fill">
            <iframe
              className="mapa"
              height="350"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3032.4978139308737!2d-3.402725684649964!3d38.99790027969774!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd6bc30dc81e088b%3A0xb42135425ecbd567!2sHospital%20Virgen%20de%20Altagracia!5e0!3m2!1ses!2ses!4v1698800000000!5m2!1ses!2ses"
              style={{ border: 0 }}
              title="Mapa Hospital Virgen de Altagracia"
            ></iframe>
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  )
}

export default InfoPage