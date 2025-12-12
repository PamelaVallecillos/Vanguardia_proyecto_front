import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';


const DoctorAppointments = () => {

    const [appointments, setAppointments] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, [])



    const fetchAppointments = async () => {
        try {

            const response = await apiService.getMyAppointments();

            if (response.data.statusCode === 200) {
                setAppointments(response.data.data);
            }

        } catch (error) {
            setError('No fue posible cargar las citas');

        }
    }




    const formatDateTime = (dateTimeString) => {
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
                // Refresh appointments list
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
                // Refresh appointments list
                fetchAppointments();
            } else {
                alert('No se pudo cancelar la cita');
            }
        } catch (error) {
            alert('Error al cancelar la cita');
        }
    };

    const formatPatientInfo = (patient) => {
        return `${patient.firstName} ${patient.lastName} (${patient.user?.email})`;
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
        <div className="container">
            <div className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Mis Citas</h1>
                    <Link to="/doctor/profile" className="btn btn-secondary">
                        Volver al Perfil
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No se encontraron citas</h3>
                        <p>No tienes citas programadas aún.</p>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-info">
                                        <h3 className="patient-name">
                                            Paciente: {formatPatientInfo(appointment.patient)}
                                        </h3>
                                        <p className="appointment-time">
                                            {formatDateTime(appointment.startTime)}
                                        </p>
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
                                                    </button><Link
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
                                            <span><strong>Fecha de Nacimiento:</strong> {new Date(appointment.patient.dateOfBirth).toLocaleDateString()}</span>
                                            <span><strong>Grupo Sanguíneo:</strong> {appointment.patient.bloodGroup?.replace('_', ' ')}</span>
                                            <span><strong>Genotipo:</strong> {appointment.patient.genotype}</span>
                                            <span><strong>Alergias:</strong> {appointment.patient.knownAllergies || 'Ninguna'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );


}
export default DoctorAppointments;