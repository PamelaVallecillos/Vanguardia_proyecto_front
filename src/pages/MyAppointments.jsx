import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';



const MyAppointments = () => {


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
            setError('Error al cargar las citas');

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
                    <Link to="/book-appointment" className="btn btn-primary">
                        Reservar Nueva Cita
                    </Link>
                </div>

                {appointments.length === 0 ? (
                    <div className="empty-state">
                        <h3>No se encontraron citas</h3>
                        <p>Aún no has reservado ninguna cita.</p>
                        <Link to="/book-appointment" className="btn btn-primary">
                            Reserva tu primera cita
                        </Link>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {appointments.map((appointment) => (
                            <div key={appointment.id} className="appointment-card">
                                <div className="appointment-header">
                                    <div className="appointment-info">
                                        <h3 className="doctor-name">
                                            Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                                        </h3>
                                        <p className="specialization">
                                            {appointment.doctor.specialization?.replace(/_/g, ' ')}
                                        </p>
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
                                            <span>{formatDateTime(appointment.startTime)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <label>Duración:</label>
                                            <span>1 hora</span>
                                        </div>
                                    </div>

                                    <div className="detail-item">
                                        <label>Propósito:</label>
                                        <span>{appointment.purposeOfConsultation}</span>
                                    </div>

                                    <div className="detail-item">
                                        <label>Síntomas:</label>
                                        <span>{appointment.initialSymptoms}</span>
                                    </div>

                                    {appointment.meetingLink && appointment.status === 'SCHEDULED' && (
                                        <div className="detail-item">
                                            <label>Enlace de la reunión:</label>
                                            <a
                                                href={appointment.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="meeting-link"
                                            >
                                                Unirse a la consulta por video
                                            </a>
                                        </div>
                                    )}

                                    {appointment.status === 'COMPLETED' && (
                                        <div className="detail-item">
                                            <Link
                                                to={`/consultation-history?appointmentId=${appointment.id}`}
                                                className="btn btn-outline btn-sm"
                                            >
                                                Ver notas de la consulta
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
export default MyAppointments;