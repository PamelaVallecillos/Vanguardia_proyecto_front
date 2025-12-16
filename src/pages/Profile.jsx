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
    const [dependents, setDependents] = useState([]);
    const [loadingDependents, setLoadingDependents] = useState(false);

    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchUserData();
        fetchDependents();
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

    const fetchDependents = async () => {
        setLoadingDependents(true);
        try {
            const response = await apiService.getMyDependents();
            if (response.data.statusCode === 200) {
                setDependents(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar dependientes:', error);
        } finally {
            setLoadingDependents(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        try {
            return new Date(dateTimeString).toLocaleString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateTimeString;
        }
    };


    const getStatusBadge = (status) => {
        const statusConfig = {
            'SCHEDULED': { class: 'status-scheduled', text: 'Programada' },
            'COMPLETED': { class: 'status-completed', text: 'Completada' },
            'CANCELLED': { class: 'status-cancelled', text: 'Cancelada' },
            'IN_PROGRESS': { class: 'status-in-progress', text: 'En progreso' }
        };

        const config = statusConfig[status] || { class: 'status-default', text: status };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };


    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita?')) {
            return;
        }

        try {
            const response = await apiService.cancelAppointment(appointmentId);
            if (response.data.statusCode === 200) {
                // Refresh appointments list
                fetchAppointments();
            } else {
                setError('Error al cancelar la cita');
            }
        } catch (error) {
            setError('Error al cancelar la cita');
        }
    };


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
                            onClick={() => {
                                setActiveTab('calendario');
                                fetchAppointments();
                            }}
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
                                    {loadingDependents ? (
                                        <p className="fb-empty-state">Cargando...</p>
                                    ) : dependents.length > 0 ? (
                                        dependents.map(dependent => (
                                            <div key={dependent.id} className="fb-dependent-item" style={{
                                                padding: '12px',
                                                borderBottom: '1px solid #eee',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div>
                                                    <strong>{dependent.firstName} {dependent.lastName}</strong>
                                                    <p style={{ fontSize: '12px', color: '#666', margin: '4px 0' }}>
                                                        {dependent.relationship} - Expediente: {dependent.expedienteNumber}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="fb-empty-state">No hay dependientes registrados</p>
                                    )}
                                    {dependents.length > 0 && (
                                        <button 
                                            className="fb-btn fb-btn-link" 
                                            onClick={() => navigate('/agregar-dependiente')}
                                        >
                                            + Agregar otro dependiente
                                        </button>
                                    )}
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
                                            
                                            {/* Número de Expediente */}
                                            <div className="alert alert-info" style={{ marginBottom: '20px' }}>
                                                <strong>Número de Expediente:</strong> {patientData.expedienteNumber || 'No asignado'}
                                            </div>
                                            
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

                                    {appointments.length === 0 ? (
                                        <div className="fb-empty-state">
                                            <h3>No se encontraron citas</h3>
                                            <p>Aún no has reservado ninguna cita.</p>
                                        </div>
                                    ) : (
                                        <div className="fb-appointments-list">
                                            {appointments.map((appointment) => (
                                                <div key={appointment.id} className="fb-appointment-card appointment-card">
                                                    <div className="appointment-header">
                                                        <div className="appointment-info">
                                                            <h3 className="doctor-name">Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}</h3>
                                                            <p className="specialization">{appointment.doctor?.specialization?.replace(/_/g, ' ')}</p>
                                                        </div>
                                                        <div className="appointment-actions">
                                                            {getStatusBadge(appointment.status)}
                                                            {appointment.status === 'SCHEDULED' && (
                                                                <button
                                                                    onClick={() => handleCancelAppointment(appointment.id)}
                                                                    className="btn btn-danger btn-sm"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="appointment-details">
                                                        <div className="detail-row">
                                                            <div className="detail-item">
                                                                <label>Fecha y hora :</label>
                                                                <span>{formatDateTime(appointment.startTime || appointment.appointmentDate)}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <label>Duración:</label>
                                                                <span>1 hora</span>
                                                            </div>
                                                        </div>

                                                        {appointment.purposeOfConsultation && (
                                                            <div className="detail-item">
                                                                <label>Propósito:</label>
                                                                <span>{appointment.purposeOfConsultation}</span>
                                                            </div>
                                                        )}

                                                        {appointment.initialSymptoms && (
                                                            <div className="detail-item">
                                                                <label>Síntomas:</label>
                                                                <span>{appointment.initialSymptoms}</span>
                                                            </div>
                                                        )}

                                                        {appointment.meetingLink && appointment.status === 'SCHEDULED' && (
                                                            <div className="detail-item">
                                                                <label>Enlace de la reunión:</label>
                                                                <a href={appointment.meetingLink} target="_blank" rel="noopener noreferrer" className="meeting-link">Unirse a la consulta por video</a>
                                                            </div>
                                                        )}

                                                        {appointment.status === 'COMPLETED' && (
                                                            <div className="detail-item">
                                                                <Link to={`/consultation-history?appointmentId=${appointment.id}`} className="btn btn-outline btn-sm">Ver notas de la consulta</Link>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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