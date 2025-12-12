import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';


const ConsultationHistory = () => {

    const [consultations, setConsultations] = useState([]);
    const [error, setError] = useState('');
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointmentId');


    useEffect(() => {
        fetchConsultationHistory()
    }, [])

    const fetchConsultationHistory = async () => {
        try {
            let response;
            if (appointmentId) {
                // Fetch consultation for specific appointment
                response = await apiService.getConsultationByAppointmentId(appointmentId);
                if (response.data.statusCode === 200) {
                    setConsultations([response.data.data]);
                }
            } else {
                // Fetch all consultation history
                response = await apiService.getConsultationHistoryForPatient();
                if (response.data.statusCode === 200) {
                    setConsultations(response.data.data);
                }
            }

        } catch (error) {
            setError('No se pudo cargar el historial de consultas');

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
                    <h1 className="page-title">
                        {appointmentId ? 'Consultation Notes' : 'Consultation History'}
                    </h1>
                    <Link to="/my-appointments" className="btn btn-secondary">
                        Volver a mis citas
                    </Link>
                </div>

                {consultations.length === 0 ? (
                    <div className="empty-state">
                        <h3>No hay historial de consultas</h3>
                        <p>No tienes ningún registro de consultas aún.</p>
                        <Link to="/book-appointment" className="btn btn-primary">
                            Reservar una cita
                        </Link>
                    </div>
                ) : (
                    <div className="consultations-list">
                        {consultations.map((consultation) => (
                            <div key={consultation.id} className="consultation-card">
                                <div className="consultation-header">
                                    <h3>Notas de Consulta</h3>
                                    <span className="consultation-date">
                                        {formatDateTime(consultation.consultationDate)}
                                    </span>
                                </div>

                                <div className="consultation-section">
                                    <h4>Notas Subjetivas</h4>
                                    <p>{consultation.subjectiveNotes || 'No se registraron notas subjetivas.'}</p>
                                </div>

                                <div className="consultation-section">
                                    <h4>Hallazgos Objetivos</h4>
                                    <p>{consultation.objectiveFindings || 'No se registraron hallazgos objetivos.'}</p>
                                </div>

                                <div className="consultation-section">
                                    <h4>Evaluación</h4>
                                    <p>{consultation.assessment || 'No se registró evaluación.'}</p>
                                </div>

                                <div className="consultation-section">
                                    <h4>Plan de Tratamiento</h4>
                                    <p>{consultation.plan || 'No se registró plan de tratamiento.'}</p>
                                </div>

                                {consultation.appointmentId && (
                                    <div className="consultation-footer">
                                        <Link
                                            to={`/my-appointments`}
                                            className="btn btn-outline btn-sm"
                                        >
                                            Ver detalles de la cita
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );



}

export default ConsultationHistory;