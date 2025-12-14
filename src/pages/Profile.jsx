import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { FiChevronDown } from 'react-icons/fi';
import CalendarComponent from '../components/CalendarComponent';



const Profile = () => {

    const [userData, setUserData] = useState(null)
    const [patientData, setPatientData] = useState(null)
    const [activeTab, setActiveTab] = useState('info-medica');
    const [appointments, setAppointments] = useState([]);
    const [consultations, setConsultations] = useState([]);

    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchUserData();
    }, [])


    const fetchUserData = async () => {

        try {

            // Fetch user details
            const userResponse = await apiService.getMyUserDetails();

            if (userResponse.data.statusCode === 200) {
                setUserData(userResponse.data.data);

                // Fetch patient profile if user is a patient
                if (userResponse.data.data.roles.some(role => role.name === 'PATIENT')) {
                    const patientResponse = await apiService.getMyPatientProfile();
                    if (patientResponse.data.statusCode === 200) {
                        setPatientData(patientResponse.data.data);
                    }
                }

            }

        } catch (error) {

            setError('Error al cargar los datos del perfil');
            console.error('Error al cargar el perfil: ', error);
        }
    };

    const fetchAppointments = async () => {
        try {
            const response = await apiService.getMyAppointments();
            if (response.data.statusCode === 200) {
                setAppointments(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar citas:', error);
        }
    };

    const fetchConsultations = async () => {
        try {
            if (!patientData?.id) {
                console.error('No patient ID available');
                return;
            }
            const response = await apiService.getConsultationHistoryForPatient(patientData.id);
            console.log('Consultations response:', response.data);
            if (response.data.statusCode === 200) {
                setConsultations(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar consultas:', error);
        }
    }


    const handleUpdateProfile = () => {
        navigate('/update-profile');
    };

    const handleUpdatePassword = () => {
        navigate('/update-password');
    };


    const handleProfilePictureChange = async (event) => {

        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', ];
        if (!validTypes.includes(file.type)) {
            setUploadError('Por favor selecciona un archivo de imagen válido (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setUploadError('El tamaño del archivo debe ser menor a 5MB');
            return;
        }

        setUploading(true);
        setUploadError('');
        setUploadSuccess('');

        try {
            const response = await apiService.uploadProfilePicture(file);
            if (response.data.statusCode === 200) {
                setUploadSuccess('¡Foto de perfil actualizada con éxito!');
                // Refresh user data to get the new profile picture URL
                fetchUserData();
                // Clear the file input
                event.target.value = '';
            } else {
                setUploadError(response.data.message || 'Error al subir la foto de perfil');
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Ocurrió un error al subir la foto');
        } finally {
            setUploading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No proporcionado';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatBloodGroup = (bloodGroup) => {
        if (!bloodGroup) return 'No proporcionado';
        return bloodGroup.replace('_', ' ');
    };

    // Construct full URL for profile picture
    const getProfilePictureUrl = () => {
        const url = userData?.profilePictureUrl;
        if (!url) return null;

        // Add cache buster when upload succeeded recently to force browser refresh
        const cacheBuster = uploadSuccess ? `?t=${Date.now()}` : '';

        try {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return `${url}${cacheBuster}`;
            }
        } catch (e) {
            // ignore
        }

        if (url.startsWith('/')) {
            return `http://localhost:8080${url}${cacheBuster}`;
        }

        return `http://localhost:8080/${url}${cacheBuster}`;
    };


    if (error) {
        return (
            <div className="container">
                <div className="form-container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }







    return (
        <div className="fb-profile-wrapper">
            {/* Header colorido tipo el gradiente actual */}
            <div className="fb-profile-header">
                <div className="container">
                    <div className="fb-profile-header-content">
                        {/* Foto de perfil */}
                        <div className="fb-profile-picture-wrapper">
                            <div className="fb-profile-picture-container">
                                {getProfilePictureUrl() ? (
                                    <img
                                        src={getProfilePictureUrl()}
                                        alt="Profile"
                                        className="fb-profile-picture"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div className={`fb-profile-picture-placeholder ${getProfilePictureUrl() ? 'hidden' : ''}`}>
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="fb-profile-picture-overlay">
                                    <label htmlFor="profile-picture-upload" className="fb-upload-label">
                                        {uploading ? 'Subiendo...' : '📷'}
                                    </label>
                                    <input
                                        id="profile-picture-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureChange}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            {uploadError && (
                                <div className="alert alert-error mt-1">
                                    {uploadError}
                                </div>
                            )}
                            {uploadSuccess && (
                                <div className="alert alert-success mt-1">
                                    {uploadSuccess}
                                </div>
                            )}
                        </div>

                        {/* Nombre e info básica */}
                        <div className="fb-profile-info">
                            <h1 className="fb-profile-name">{userData?.name}</h1>
                            <p className="fb-profile-friends">{userData?.email}</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="fb-profile-actions">
                        <button onClick={() => navigate('/agregar-dependiente')} className="fb-btn fb-btn-primary">
                            + Agregar dependiente
                        </button>
                        <button onClick={handleUpdateProfile} className="fb-btn fb-btn-secondary">
                            ✏️ Editar perfil
                        </button>
                        <button onClick={handleUpdatePassword} className="fb-btn fb-btn-icon">
                            <FiChevronDown size={20} />
                        </button>
                    </div>

                    {/* Tabs de navegación */}
                    <div className="fb-profile-tabs">
                        <button 
                            className={`fb-tab ${activeTab === 'info-medica' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info-medica')}
                        >
                            Información Médica
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'hacer-cita' ? 'active' : ''}`}
                            onClick={() => navigate('/book-appointment')}
                        >
                            Hacer cita
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'mis-citas' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('mis-citas');
                                fetchAppointments();
                            }}
                        >
                            Mis citas
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'historial-consultas' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('historial-consultas');
                                fetchConsultations();
                            }}
                        >
                            Historial de consultas
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'historial-doctores' ? 'active' : ''}`}
                            onClick={() => setActiveTab('historial-doctores')}
                        >
                            Historial de Doctores
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'calendario' ? 'active' : ''}`}
                            onClick={() => setActiveTab('calendario')}
                        >
                            Calendario
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="fb-profile-content">
                <div className="container">
                    <div className="fb-profile-layout">
                        {/* Columna izquierda: Dependientes */}
                        <div className="fb-profile-sidebar">
                            <div className="fb-card">
                                <h3 className="fb-card-title">Dependientes</h3>
                                <div className="fb-dependents-list">
                                    <p className="fb-empty-state">No hay dependientes registrados</p>
                                    <button className="fb-btn fb-btn-link">Ver todos los dependientes</button>
                                </div>
                            </div>

                            <div className="fb-card">
                                <h3 className="fb-card-title">Información de Cuenta</h3>
                                <div className="fb-info-list">
                                    <div className="fb-info-item">
                                        <span className="fb-info-icon">📧</span>
                                        <span className="fb-info-text">{userData?.email || 'No proporcionado'}</span>
                                    </div>
                                    <div className="fb-info-item">
                                        <span className="fb-info-icon">👤</span>
                                        <span className="fb-info-text">
                                            {userData?.roles?.map(role => role.name).join(', ') || 'No proporcionado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna derecha: Contenido principal */}
                        <div className="fb-profile-main">
                            {activeTab === 'info-medica' && (
                                <>
                                    {patientData ? (
                                        <div className="fb-card">
                                            <h3 className="fb-card-title">Información Médica</h3>
                                            <div className="fb-medical-grid">
                                                <div className="fb-medical-item">
                                                    <label>Nombre</label>
                                                    <p>{patientData.firstName || 'No proporcionado'}</p>
                                                </div>
                                                <div className="fb-medical-item">
                                                    <label>Apellido</label>
                                                    <p>{patientData.lastName || 'No proporcionado'}</p>
                                                </div>
                                                <div className="fb-medical-item">
                                                    <label>Teléfono</label>
                                                    <p>{patientData.phone || 'No proporcionado'}</p>
                                                </div>
                                                <div className="fb-medical-item">
                                                    <label>Fecha de Nacimiento</label>
                                                    <p>{formatDate(patientData.dateOfBirth)}</p>
                                                </div>
                                                <div className="fb-medical-item">
                                                    <label>Grupo Sanguíneo</label>
                                                    <p>{formatBloodGroup(patientData.bloodGroup)}</p>
                                                </div>
                                                <div className="fb-medical-item">
                                                    <label>Genotipo</label>
                                                    <p>{patientData.genotype || 'No proporcionado'}</p>
                                                </div>
                                                <div className="fb-medical-item fb-full-width">
                                                    <label>Alergias Conocidas</label>
                                                    <p>{patientData.knownAllergies || 'No hay alergias conocidas'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="fb-card">
                                            <div className="alert alert-info">
                                                <p>No se encontró un perfil de paciente. Por favor, actualice su perfil para agregar información médica.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'mis-citas' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Mis Citas</h3>
                                    {appointments.length > 0 ? (
                                        <div className="fb-appointments-list">
                                            {appointments.map((appointment) => (
                                                <div key={appointment.id} className="fb-appointment-card">
                                                    <div className="fb-appointment-header">
                                                        <h4>{appointment.doctorName || 'Doctor'}</h4>
                                                        <span className={`fb-status-badge status-${appointment.status?.toLowerCase()}`}>
                                                            {appointment.status}
                                                        </span>
                                                    </div>
                                                    <div className="fb-appointment-details">
                                                        <p><strong>Fecha:</strong> {new Date(appointment.appointmentDate).toLocaleDateString('es-ES')}</p>
                                                        <p><strong>Hora:</strong> {appointment.appointmentTime}</p>
                                                        {appointment.reason && <p><strong>Motivo:</strong> {appointment.reason}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No tienes citas programadas</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'historial-consultas' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Historial de Consultas</h3>
                                    {consultations.length > 0 ? (
                                        <div className="fb-consultations-list">
                                            {consultations.map((consultation) => (
                                                <div key={consultation.id} className="fb-consultation-card">
                                                    <div className="fb-consultation-header">
                                                        <h4>Notas de Consulta</h4>
                                                        <span className="fb-consultation-date">
                                                            {new Date(consultation.consultationDate).toLocaleDateString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="fb-consultation-details">
                                                        {consultation.subjectiveNotes && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Notas Subjetivas:</strong></p>
                                                                <p>{consultation.subjectiveNotes}</p>
                                                            </div>
                                                        )}
                                                        {consultation.objectiveFindings && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Hallazgos Objetivos:</strong></p>
                                                                <p>{consultation.objectiveFindings}</p>
                                                            </div>
                                                        )}
                                                        {consultation.assessment && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Evaluación:</strong></p>
                                                                <p>{consultation.assessment}</p>
                                                            </div>
                                                        )}
                                                        {consultation.plan && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Plan de Tratamiento:</strong></p>
                                                                <p>{consultation.plan}</p>
                                                            </div>
                                                        )}
                                                        {!consultation.subjectiveNotes && !consultation.objectiveFindings && 
                                                         !consultation.assessment && !consultation.plan && (
                                                            <p className="fb-empty-state">No hay detalles disponibles para esta consulta</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No hay consultas en tu historial</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'historial-doctores' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Historial de Doctores</h3>
                                    <p className="fb-empty-state">No hay historial de doctores disponible</p>
                                </div>
                            )}

                            {activeTab === 'calendario' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Calendario de Citas</h3>
                                    <div className="calendar-container">
                                        <CalendarComponent appointments={appointments} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

}


export default Profile;