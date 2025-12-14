import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import PasswordInput from '../components/PasswordInput';


const DoctorRegister = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        licenseNumber: '',
        specialization: '',
        roles: ['DOCTOR']
    });


    const [specializations, setSpecializations] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingSpecializations, setLoadingSpecializations] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSpecializations();
    }, []);


    const fetchSpecializations = async () => {
        try {
            const response = await apiService.getAllDocgetAllSpecializationEnumstors();
            if (response.data.statusCode === 200) {
                setSpecializations(response.data.data);
            }
        } catch (error) {
            setError('No se pudieron cargar las especializaciones');
        } finally {
            setLoadingSpecializations(false);
        }
    };


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (!formData.specialization) {
            setError('Por favor seleccione una especialización');
            setLoading(false);
            return;
        }

        if (!formData.licenseNumber) {
            setError('Por favor ingrese su número de licencia');
            setLoading(false);
            return;
        }

        try {
            const response = await apiService.register(formData);

            if (response.data.statusCode === 200) {

                setSuccess('¡Registro de doctor exitoso! Ahora puede iniciar sesión.');

                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    licenseNumber: '',
                    specialization: '',
                    roles: ['DOCTOR']
                });

                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError(response.data.message || 'Registro fallido');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error durante el registro');
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">Registrar como Doctor</h2>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nombre Completo</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <PasswordInput
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Número de Licencia</label>
                        <input
                            type="text"
                            name="licenseNumber"
                            className="form-input"
                            value={formData.licenseNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Especialización</label>
                        <select
                            name="specialization"
                            className="form-select"
                            value={formData.specialization}
                            onChange={handleChange}
                            required
                            disabled={loadingSpecializations}
                        >
                            <option value="">Seleccione una especialización</option>
                            {specializations.map((spec) => (
                                <option key={spec} value={spec}>
                                    {spec.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                        {loadingSpecializations && (
                            <small>Cargando especializaciones...</small>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="form-btn"
                        disabled={loading || loadingSpecializations}
                    >
                        {loading ? 'Registrando...' : 'Registrar como Doctor'}
                    </button>
                </form>

                <div className="form-link">
                    <p>
                        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                    <p className="mt-1">
                        ¿Quieres registrarte como paciente? <Link to="/register">Haz clic aquí</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
export default DoctorRegister;