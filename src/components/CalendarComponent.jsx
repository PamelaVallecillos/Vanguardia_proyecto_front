import { useState } from 'react';

const CalendarComponent = ({ appointments = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

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

    const getAppointmentsForDate = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return appointments.filter(apt => apt.appointmentDate === dateStr);
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
                    <div className="calendar-appointments">
                        {dayAppointments.map((apt, idx) => (
                            <div key={idx} className="calendar-appointment-dot" title={`${apt.appointmentTime} - ${apt.doctorName}`}>
                                •
                            </div>
                        ))}
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
        </div>
    );
};

export default CalendarComponent;
