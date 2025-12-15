import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { FiChevronDown } from 'react-icons/fi';
import CalendarComponent from '../../components/CalendarComponent';



const DoctorProfile = () => {


    const [userData, setUserData] = useState(null);
    const [doctorData, setDoctorData] = useState(null);
    const [activeTab, setActiveTab] = useState('info-profesional');
    const [appointments, setAppointments] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadSuccess, setUploadSuccess] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        fetchDoctorData();
    }, [])


    const fetchDoctorData = async () => {
        try {

            // Fetch user details
            const userResponse = await apiService.getMyUserDetails();

            if (userResponse.data.statusCode === 200) {
                setUserData(userResponse.data.data);

                // Fetch doctor profile
                const doctorResponse = await apiService.getMyDoctorProfile();
                if (doctorResponse.data.statusCode === 200) {
                    setDoctorData(doctorResponse.data.data);
                }
            }

        } catch (error) {
            setError('Error al cargar los datos del perfil');
            console.error('Error al cargar el perfil del doctor:', error);

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
            const response = await apiService.getConsultationsForDoctor();
            if (response.data.statusCode === 200) {
                console.log('📋 DATOS DE CONSULTAS RECIBIDOS:', response.data.data);
                console.log('📋 PRIMERA CONSULTA COMPLETA:', JSON.stringify(response.data.data[0], null, 2));
                setConsultations(response.data.data);
            }
        } catch (error) {
            console.error('Error al cargar consultas:', error);
            console.error('Detalles del error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message
            });
            setError('Error al cargar el historial de consultas. El servidor devolvió un error 500.');
        }
    };

    const fetchPatients = async () => {
        try {
            // Aquí necesitarás un endpoint específico para obtener pacientes del doctor
            // const response = await apiService.getPatientsForDoctor();
            // if (response.data.statusCode === 200) {
            //     setPatients(response.data.data);
            // }
        } catch (error) {
            console.error('Error al cargar pacientes:', error);
        }
    }


    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return '';
        return new Date(dateTimeString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const getStatusBadge = (status) => {
        const statusConfig = {
            'SCHEDULED': { class: 'status-scheduled', text: 'Programada' },
            'COMPLETED': { class: 'status-completed', text: 'Completada' },
            'CANCELLED': { class: 'status-cancelled', text: 'Cancelada' },
            'IN_PROGRESS': { class: 'status-in-progress', text: 'En Progreso' }
        };

        const config = statusConfig[status] || { class: 'status-default', text: status };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };


    const handleCompleteAppointment = async (appointmentId) => {
        if (!window.confirm('¿Está seguro de que desea marcar esta cita como completada?')) {
            return;
        }

        try {
            const response = await apiService.completeAppointment(appointmentId);
            if (response.data.statusCode === 200) {
                fetchAppointments();
            } else {
                alert('No se pudo completar la cita');
            }
        } catch (error) {
            alert('Error al completar la cita');
        }
    };


    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('¿Está seguro de que desea cancelar esta cita?')) {
            return;
        }

        try {
            const response = await apiService.cancelAppointment(appointmentId);
            if (response.data.statusCode === 200) {
                fetchAppointments();
            } else {
                alert('No se pudo cancelar la cita');
            }
        } catch (error) {
            alert('Error al cancelar la cita');
        }
    };


    const formatPatientInfo = (patient) => {
        if (!patient) return 'Paciente';
        return `${patient.firstName} ${patient.lastName} (${patient.user?.email})`;
    };



    const handleUpdateProfile = () => {
        navigate('/doctor/update-profile');
    };

    const handleUpdatePassword = () => {
        navigate('/update-password');
    };


    const handleProfilePictureChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Por favor seleccione un archivo válido para las imagenes (JPEG, PNG, GIF)');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('El tamaño del archivo debe ser menor a 10MB');
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
                fetchDoctorData();
                // Clear the file input
                event.target.value = '';
            } else {
                setUploadError(response.data.message || 'No se pudo subir la foto de perfil');
            }
        } catch (error) {
            setUploadError(error.response?.data?.message || 'Ocurrió un error al subir la foto');
        } finally {
            setUploading(false);
        }
    };



    const formatSpecialization = (spec) => {
        if (!spec) return 'No especificado';
        return spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    };


    // Construct full URL for profile picture
    const getProfilePictureUrl = () => {
        const url = userData?.profilePictureUrl;
        if (!url) return null;

        // If backend returned a relative path, prefix the API origin.
        // Also add a cache-buster when upload was just successful so browser fetches new image.
        const cacheBuster = uploadSuccess ? `?t=${Date.now()}` : '';

        try {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return `${url}${cacheBuster}`;
            }
        } catch (e) {
            // fallthrough
        }

        // If it's a root-relative path like '/uploads/..'
        if (url.startsWith('/')) {
            return `http://localhost:8080${url}${cacheBuster}`;
        }

        // If it's a bare filename or other relative path, assume backend serves from root
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
                                    {userData?.name?.charAt(0)?.toUpperCase() || 'D'}
                                </div>
                                <div className="fb-profile-picture-overlay">
                                    <label htmlFor="doctor-profile-picture-upload" className="fb-upload-label">
                                        {uploading ? 'Subiendo...' : '📷'}
                                    </label>
                                    <input
                                        id="doctor-profile-picture-upload"
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
                            <h1 className="fb-profile-name">Dr. {userData?.name}</h1>
                            <p className="fb-profile-friends">{doctorData && formatSpecialization(doctorData.specialization)}</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="fb-profile-actions">
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
                            className={`fb-tab ${activeTab === 'info-profesional' ? 'active' : ''}`}
                            onClick={() => setActiveTab('info-profesional')}
                        >
                            Información profesional
                        </button>
                        <button 
                            className={`fb-tab ${activeTab === 'control-citas' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('control-citas');
                                fetchAppointments();
                            }}
                        >
                            Control de citas
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
                            className={`fb-tab ${activeTab === 'historial-pacientes' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab('historial-pacientes');
                                fetchPatients();
                            }}
                        >
                            Historial de pacientes
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
                        {/* Columna izquierda: Información de contacto */}
                        <div className="fb-profile-sidebar">
                            <div className="fb-card">
                                <h3 className="fb-card-title">Información de Contacto</h3>
                                <div className="fb-info-list">
                                    <div className="fb-info-item">
                                        <span className="fb-info-icon">📧</span>
                                        <span className="fb-info-text">{userData?.email || 'No proporcionado'}</span>
                                    </div>
                                    {doctorData && (
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">📞</span>
                                            <span className="fb-info-text">{doctorData.phone || 'No proporcionado'}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {doctorData && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Datos Personales</h3>
                                    <div className="fb-info-list">
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">👤</span>
                                            <span className="fb-info-text">
                                                {`${doctorData.firstName || ''} ${doctorData.lastName || ''}`.trim() || 'No proporcionado'}
                                            </span>
                                        </div>
                                        <div className="fb-info-item">
                                            <span className="fb-info-icon">⚧</span>
                                            <span className="fb-info-text">{doctorData.gender || 'No proporcionado'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Columna derecha: Contenido principal */}
                        <div className="fb-profile-main">
                            {activeTab === 'info-profesional' && (
                                <>
                                    {doctorData ? (
                                        <>
                                            {/* Información Profesional */}
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Información Profesional</h3>
                                                <div className="fb-medical-grid">
                                                    <div className="fb-medical-item">
                                                        <label>Número de Licencia</label>
                                                        <p>{doctorData.licenseNumber || 'No proporcionado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Tiempo de Consulta</label>
                                                        <p>{doctorData.consultationDuration ? `${doctorData.consultationDuration} minutos` : 'No especificado'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Especialización Principal</label>
                                                        <p>{formatSpecialization(doctorData.specialization)}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Especializaciones Adicionales</label>
                                                        {doctorData.additionalSpecializations && doctorData.additionalSpecializations.length > 0 ? (
                                                            <div className="tags-display">
                                                                {doctorData.additionalSpecializations.map((spec, index) => (
                                                                    <span key={index} className="tag-display">
                                                                        {spec.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-muted">No se han agregado especializaciones adicionales</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Restricciones de Pacientes */}
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Restricciones de Pacientes</h3>
                                                <div className="fb-medical-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                                    <div className="fb-medical-item">
                                                        <label>Restricción de Género</label>
                                                        <p>
                                                            {doctorData.genderRestriction 
                                                                ? doctorData.genderRestriction === 'MASCULINO' 
                                                                    ? 'Solo Hombres' 
                                                                    : doctorData.genderRestriction === 'FEMENINO' 
                                                                        ? 'Solo Mujeres' 
                                                                        : 'Sin restricción'
                                                                : 'Sin restricción'}
                                                        </p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Edad Mínima</label>
                                                        <p>{doctorData.minAge != null ? `${doctorData.minAge} años` : 'Sin restricción'}</p>
                                                    </div>
                                                    <div className="fb-medical-item">
                                                        <label>Edad Máxima</label>
                                                        <p>{doctorData.maxAge != null ? `${doctorData.maxAge} años` : 'Sin restricción'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Horario de Atención */}
                                            <div className="fb-card">
                                                <h3 className="fb-card-title">Horario de Atención</h3>
                                                {doctorData.schedules && doctorData.schedules.length > 0 ? (
                                                    <div className="schedule-display-table">
                                                        <table className="schedule-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Día</th>
                                                                    <th>Horario</th>
                                                                    <th>Almuerzo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {doctorData.schedules.map((schedule, index) => {
                                                                    const dayNames = {
                                                                        'MONDAY': 'Lunes',
                                                                        'TUESDAY': 'Martes',
                                                                        'WEDNESDAY': 'Miércoles',
                                                                        'THURSDAY': 'Jueves',
                                                                        'FRIDAY': 'Viernes',
                                                                        'SATURDAY': 'Sábado',
                                                                        'SUNDAY': 'Domingo'
                                                                    };
                                                                    return (
                                                                        <tr key={index}>
                                                                            <td className="schedule-day">{dayNames[schedule.dayOfWeek] || schedule.dayOfWeek}</td>
                                                                            <td className="schedule-hours">
                                                                                {schedule.startTime} - {schedule.endTime}
                                                                            </td>
                                                                            <td className="schedule-lunch">
                                                                                {schedule.lunchStart && schedule.lunchEnd 
                                                                                    ? `${schedule.lunchStart} - ${schedule.lunchEnd}`
                                                                                    : 'Sin almuerzo'
                                                                                }
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted">No se ha configurado horario de atención</p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="fb-card">
                                            <div className="alert alert-info">
                                                <p>No se encontró un perfil de doctor. Por favor, actualice su perfil para agregar información profesional.</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {activeTab === 'control-citas' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Control de Citas</h3>

                                    {appointments.length === 0 ? (
                                        <div className="fb-empty-state">
                                            <h3>No se encontraron citas</h3>
                                            <p>No tienes citas programadas aún.</p>
                                        </div>
                                    ) : (
                                        <div className="appointments-list">
                                            {appointments.map((appointment) => (
                                                <div key={appointment.id} className="appointment-card">
                                                    <div className="appointment-header">
                                                        <div className="appointment-info">
                                                            <h3 className="patient-name">Paciente: {formatPatientInfo(appointment.patient)}</h3>
                                                            <p className="appointment-time">{formatDateTime(appointment.startTime)}</p>
                                                        </div>
                                                        <div className="appointment-actions">
                                                            {getStatusBadge(appointment.status)}
                                                            <div className="action-buttons">
                                                                {appointment.status === 'SCHEDULED' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleCompleteAppointment(appointment.id)}
                                                                            className="btn btn-success btn-sm"
                                                                        >
                                                                            Completar
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                                            className="btn btn-danger btn-sm"
                                                                        >
                                                                            Cancelar
                                                                        </button>
                                                                        <Link
                                                                            to={`/doctor/patient-consultation-history?patientId=${appointment.patient.id}`}
                                                                            className="btn btn-info btn-sm"
                                                                        >
                                                                            Ver Historial
                                                                        </Link>
                                                                    </>
                                                                )}
                                                                {appointment.status === 'COMPLETED' && (
                                                                    <Link
                                                                        to={`/doctor/create-consultation?appointmentId=${appointment.id}`}
                                                                        className="btn btn-primary btn-sm"
                                                                    >
                                                                        Crear Consulta
                                                                    </Link>
                                                                )}
                                                                {appointment.meetingLink && appointment.status === 'SCHEDULED' && (
                                                                    <a
                                                                        href={appointment.meetingLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-outline btn-sm"
                                                                    >
                                                                        Unirse a la Reunión
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="appointment-details">
                                                        <div className="detail-row">
                                                            <div className="detail-item">
                                                                <label>Propósito:</label>
                                                                <span>{appointment.purposeOfConsultation}</span>
                                                            </div>
                                                            <div className="detail-item">
                                                                <label>Duración:</label>
                                                                <span>1 hora</span>
                                                            </div>
                                                        </div>

                                                        <div className="detail-item">
                                                            <label>Síntomas:</label>
                                                            <span>{appointment.initialSymptoms}</span>
                                                        </div>

                                                        <div className="detail-item">
                                                            <label>Información del Paciente:</label>
                                                            <div className="patient-details">
                                                                <span><strong>Fecha de Nacimiento:</strong> {appointment.patient?.dateOfBirth ? new Date(appointment.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                                                                <span><strong>Grupo Sanguíneo:</strong> {appointment.patient?.bloodGroup?.replace('_', ' ')}</span>
                                                                <span><strong>Genotipo:</strong> {appointment.patient?.genotype}</span>
                                                                <span><strong>Alergias:</strong> {appointment.patient?.knownAllergies || 'Ninguna'}</span>
                                                            </div>
                                                        </div>
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
                                    {error && error.includes('historial de consultas') && (
                                        <div className="fb-error-message" style={{
                                            padding: '15px',
                                            backgroundColor: '#fee',
                                            color: '#c33',
                                            borderRadius: '8px',
                                            marginBottom: '20px',
                                            border: '1px solid #fcc'
                                        }}>
                                            {error}
                                            <br />
                                            <small>Verifica la consola del navegador para más detalles técnicos.</small>
                                        </div>
                                    )}
                                    {consultations.length > 0 ? (
                                        <div className="fb-consultations-list">
                                            {consultations.map((consultation) => (
                                                <div key={consultation.id} className="fb-consultation-card">
                                                    <div className="fb-consultation-header">
                                                        <h4>Consulta - {consultation.patientName || 'Paciente'}</h4>
                                                        <span className="fb-consultation-date">
                                                            {new Date(consultation.consultationDate).toLocaleDateString('es-ES', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="fb-consultation-details">
                                                        {consultation.appointmentId && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Detalles de la Cita:</strong></p>
                                                                <p>ID de Cita: {consultation.appointmentId}</p>
                                                            </div>
                                                        )}
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
                                                                <p><strong>Plan de Tratamiento y/o Receta Médica:</strong></p>
                                                                <p>{consultation.plan}</p>
                                                            </div>
                                                        )}
                                                        {consultation.documents && consultation.documents.length > 0 && (
                                                            <div className="fb-consultation-section">
                                                                <p><strong>Documentos Adjuntos:</strong></p>
                                                                <div className="fb-documents-list">
                                                                    {consultation.documents.map((doc, index) => (
                                                                        <a 
                                                                            key={index}
                                                                            href={`http://localhost:8080${doc.fileUrl}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="fb-document-link"
                                                                            style={{
                                                                                display: 'block',
                                                                                padding: '8px 12px',
                                                                                marginBottom: '8px',
                                                                                backgroundColor: '#f0f2f5',
                                                                                borderRadius: '6px',
                                                                                textDecoration: 'none',
                                                                                color: '#1877f2',
                                                                                transition: 'background-color 0.2s'
                                                                            }}
                                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#e4e6eb'}
                                                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f2f5'}
                                                                        >
                                                                            📎 {doc.fileName || `Documento ${index + 1}`}
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No hay consultas en el historial</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'historial-pacientes' && (
                                <div className="fb-card">
                                    <h3 className="fb-card-title">Historial de Pacientes</h3>
                                    {patients.length > 0 ? (
                                        <div className="fb-patients-list">
                                            {patients.map((patient) => (
                                                <div key={patient.id} className="fb-patient-card">
                                                    <div className="fb-patient-header">
                                                        <h4>{patient.firstName} {patient.lastName}</h4>
                                                    </div>
                                                    <div className="fb-patient-details">
                                                        <p><strong>Última visita:</strong> {patient.lastVisit ? new Date(patient.lastVisit).toLocaleDateString('es-ES') : 'N/A'}</p>
                                                        <p><strong>Total de consultas:</strong> {patient.consultationsCount || 0}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="fb-empty-state">No hay historial de pacientes disponible</p>
                                    )}
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
export default DoctorProfile;