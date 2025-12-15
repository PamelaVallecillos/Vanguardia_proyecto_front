import { useState } from 'react';

const CalendarComponent = ({ appointments = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const normalizeDateStr = (dateObj) => {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const getAppointmentsForDate = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return appointments.filter(apt => {
            // If appointment has explicit appointmentDate (YYYY-MM-DD) use it
            if (apt.appointmentDate) {
                return apt.appointmentDate === dateStr;
            }

            // If appointment has a startTime (ISO) parse it
            if (apt.startTime) {
                try {
                    const d = new Date(apt.startTime);
                    return normalizeDateStr(d) === dateStr;
                } catch (e) {
                    return false;
                }
            }

            // Fallback: no date info
            return false;
        });
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const formatTime = (apt) => {
        if (apt.startTime) {
            try {
                return new Date(apt.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            } catch (e) {
                return apt.appointmentTime || '';
            }
        }
        return apt.appointmentTime || '';
    };

    const getAppointmentTitle = (apt) => {
        if (apt.doctor) {
            return `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`;
        }
        return apt.doctorName || apt.purposeOfConsultation || 'Cita';
    };

    const truncateText = (text, maxLength = 15) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const closeModal = () => {
        setSelectedAppointment(null);
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                          currentDate.getFullYear() === today.getFullYear();

    // Generate calendar days
    const calendarDays = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = isCurrentMonth && day === today.getDate();
        const dayAppointments = getAppointmentsForDate(day);
        const hasAppointments = dayAppointments.length > 0;

        calendarDays.push(
            <div 
                key={day} 
                className={`calendar-day ${isToday ? 'today' : ''} ${hasAppointments ? 'has-appointments' : ''}`}
            >
                <div className="calendar-day-number">{day}</div>
                {hasAppointments && (
                    <div className="calendar-event-list">
                        {dayAppointments.slice(0, 3).map((apt, idx) => (
                            <div 
                                key={idx} 
                                className="calendar-event-item"
                                onClick={() => setSelectedAppointment(apt)}
                            >
                                <span className="event-time">{formatTime(apt)}</span>
                                <span className="event-title">{truncateText(getAppointmentTitle(apt), 12)}</span>
                            </div>
                        ))}
                        {dayAppointments.length > 3 && (
                            <div className="calendar-event-more">
                                +{dayAppointments.length - 3} más
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="calendar-wrapper">
            <div className="calendar-header">
                <button onClick={previousMonth} className="calendar-nav-btn">❮</button>
                <div className="calendar-month-year">
                    <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                </div>
                <button onClick={nextMonth} className="calendar-nav-btn">❯</button>
            </div>

            <div className="calendar-today-btn-wrapper">
                <button onClick={goToToday} className="calendar-today-btn">Hoy</button>
            </div>

            <div className="calendar-weekdays">
                {dayNames.map(day => (
                    <div key={day} className="calendar-weekday">{day}</div>
                ))}
            </div>

            <div className="calendar-grid">
                {calendarDays}
            </div>

            <div className="calendar-legend">
                <div className="legend-item">
                    <span className="legend-dot today-dot"></span>
                    <span>Hoy</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot appointment-dot"></span>
                    <span>Citas programadas</span>
                </div>
            </div>

            {selectedAppointment && (
                <div className="calendar-modal-overlay" onClick={closeModal}>
                    <div className="calendar-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="calendar-modal-header">
                            <h3>Cita</h3>
                            <button className="calendar-modal-close" onClick={closeModal}>✕</button>
                        </div>
                        <div className="calendar-modal-body">
                            <div className="modal-title">
                                {getAppointmentTitle(selectedAppointment)}
                            </div>
                            <div className="modal-info-item">
                                <strong>Fecha:</strong> {selectedAppointment.startTime 
                                    ? new Date(selectedAppointment.startTime).toLocaleDateString('es-ES', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })
                                    : selectedAppointment.appointmentDate}
                            </div>
                            <div className="modal-info-item">
                                <strong>Hora:</strong> {formatTime(selectedAppointment)}
                            </div>
                            {selectedAppointment.doctor && (
                                <div className="modal-info-item">
                                    <strong>Especialización:</strong> {selectedAppointment.doctor.specialization?.replace(/_/g, ' ')}
                                </div>
                            )}
                            {selectedAppointment.purposeOfConsultation && (
                                <div className="modal-info-item">
                                    <strong>Propósito:</strong> {selectedAppointment.purposeOfConsultation}
                                </div>
                            )}
                            {selectedAppointment.initialSymptoms && (
                                <div className="modal-info-item">
                                    <strong>Síntomas:</strong> {selectedAppointment.initialSymptoms}
                                </div>
                            )}
                            {selectedAppointment.status && (
                                <div className="modal-info-item">
                                    <strong>Estado:</strong> <span className={`status-badge status-${selectedAppointment.status.toLowerCase()}`}>{selectedAppointment.status}</span>
                                </div>
                            )}
                            {selectedAppointment.patient && (
                                <div className="modal-info-item">
                                    <strong>Paciente:</strong> {selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}
                                </div>
                            )}
                            {selectedAppointment.meetingLink && selectedAppointment.status === 'SCHEDULED' && (
                                <div className="modal-info-item">
                                    <a href={selectedAppointment.meetingLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                                        Unirse a la reunión
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarComponent;
