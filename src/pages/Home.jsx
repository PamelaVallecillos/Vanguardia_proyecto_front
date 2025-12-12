import { Link } from "react-router-dom";
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const Home = () => {

    const [search, setSearch] = useState('');

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // For design-only, we don't perform navigation — placeholder for future integration
        console.log('Search submitted:', search);
    }

    return (
        <div className="home">

            {/* Hero Section */}
            <section className="hero-section">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h1 className="hero-title">
                                Bienvenido a  <span className="brand">AgendaSaud</span>
                            </h1>
                            <p className="hero-subtitle">
                                Conéctate con profesionales de la salud desde la comodidad de tu hogar..
                                Atención médica de calidad, accesible, cómoda y segura..
                            </p>
                            <div className="hero-stats">
                                <div className="stat">
                                    <div className="stat-number">24/7</div>
                                    <div className="stat-label">Disponible</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">50+</div>
                                    <div className="stat-label">Especialistas</div>
                                </div>
                                <div className="stat">
                                    <div className="stat-number">1000+</div>
                                    <div className="stat-label">Pacientes atendidos</div>
                                </div>
                            </div>
                            <div className="hero-actions">
                                <Link to="/register" className="btn btn-primary btn-large">
                                    Únete como paciente
                                </Link>
                                <Link to="/register-doctor" className="btn btn-secondary btn-large">
                                    Únete como doctor
                                </Link>
                            </div>
                        </div>
                        <div className="hero-image">
                            <div className="image-placeholder">
                                <div className="medical-icon">🏥</div>
                                <p>Telemedicine Illustration</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>




            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Porque escoger AgendaSalud?</h2>
                        <p>Experimenta atención médica que llega a ti</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">⏰</div>
                            <h3>Acceso rápido</h3>
                            <p>Obtén consultas médicas en minutos, sin salas de espera ni largas colas.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏠</div>
                            <h3>Desde cualquier lugar</h3>
                            <p>Conéctate con doctores desde tu hogar, oficina o cualquier lugar con acceso a internet.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Seguro y privado</h3>
                            <p>Tu información médica está protegida con medidas de seguridad de nivel empresarial.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💼</div>
                            <h3>Doctores expertos</h3>
                            <p>Consulta con profesionales de la salud verificados y experimentados en diversas especialidades.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">📱</div>
                            <h3>Fácil de usar</h3>
                            <p>Plataforma simple e intuitiva diseñada para pacientes de todas las habilidades técnicas.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💊</div>
                            <h3>Servicios de prescripción</h3>
                            <p>Obtén recetas digitales y consejos médicos para problemas de salud comunes.</p>
                        </div>
                    </div>
                </div>
            </section>




            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Cómo Funciona</h2>
                        <p>Obtener atención médica nunca ha sido tan fácil</p>
                    </div>
                    <div className="steps">
                        <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h3>Crea tu cuenta</h3>
                                <p>Regístrate como paciente y completa tu perfil médico en minutos.</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h3>Reserva una cita</h3>
                                <p>Elige entre los doctores disponibles y selecciona un horario conveniente.</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h3>Consulta por video</h3>
                                <p>Conéctate con tu doctor a través de una videollamada segura en el horario programado.</p>
                            </div>
                        </div>
                        <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h3>Recibe atención</h3>
                                <p>Obtén diagnósticos, planes de tratamiento y recetas según sea necesario.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>





            {/* Specialties Section */}
            <section className="specialties-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Especialidades Médicas Disponibles</h2>
                        <p>Atención médica integral en diversas áreas médicas</p>

                        {/* Google-like search bar placed under subtitle */}
                        <form className="google-search" onSubmit={handleSearchSubmit} role="search" aria-label="Buscar especialidades">
                            <label htmlFor="specialty-search" className="sr-only">Buscar especialidad</label>
                            <div className="google-search__inner">
                                <FiSearch className="google-search__icon" aria-hidden="true" />
                                <input
                                    id="specialty-search"
                                    type="search"
                                    className="google-search__input"
                                    placeholder="Buscar especialidades médicas, doctores o temas..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    aria-label="Buscar especialidad"
                                />
                            </div>
                        </form>
                    </div>
                    <div className="specialties-grid">
                        <div className="specialty-card">
                            <div className="specialty-icon">⚕️</div>
                            <h4>Especialidades Clínicas Generales</h4>
                            <p>Atención primaria, diagnóstico inicial y manejo del bienestar integral.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">🩺</div>
                            <h4>Medicina Interna y Subespecialidades</h4>
                            <p>Diagnóstico y tratamiento no quirúrgico de enfermedades complejas en adultos.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">👶</div>
                            <h4>Especialidades Pediátricas</h4>
                            <p>Salud y desarrollo especializado para bebés, niños y adolescentes.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">🤰</div>
                            <h4>Obstetricia y Ginecología</h4>
                            <p>Cuidado integral de la salud femenina, reproductiva y durante el embarazo.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">🔬</div>
                            <h4>Especialidades de Diagnóstico</h4>
                            <p>Estudios de imagen, análisis de laboratorio y evaluación de enfermedades avanzadas.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">🩹</div>
                            <h4>Especialidades Quirúrgicas</h4>
                            <p>Tratamientos mediante intervención quirúrgica en diversos sistemas del cuerpo.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">🗣️</div>
                            <h4>Terapia</h4>
                            <p>Recuperación física, funcional y apoyo para la comunicación y relaciones.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">😊</div>
                            <h4>Salud Mental</h4>
                            <p>Evaluación, diagnóstico y tratamiento de trastornos emocionales y conductuales.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">🦷</div>
                            <h4>Dental</h4>
                            <p>Prevención, diagnóstico y tratamiento de la salud oral y dental.</p>
                        </div>
                        <div className="specialty-card">
                            <div className="specialty-icon">👁️</div>
                            <h4>Visión </h4>
                            <p>Cuidado y tratamiento de los ojos, la salud visual y enfermedades oculares.</p>
                        </div>
                    </div>
                </div>
            </section>






            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>¿Listo para comenzar?</h2>
                        <p>Únete a miles de pacientes y doctores que ya usan AgendaSalud</p>
                        <div className="cta-actions">
                            <Link to="/register" className="btn btn-primary btn-large">
                                Comienza tu viaje
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-large">
                                ¿Ya tienes una cuenta? Inicia sesión
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    )

}
export default Home;