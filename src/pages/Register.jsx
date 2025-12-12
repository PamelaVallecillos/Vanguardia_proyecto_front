
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';


const Register = () => {

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


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

        try {

            const response = await apiService.register(formData);
            if (response.data.statusCode === 200) {
                setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
                setFormData({ name: '', email: '', password: '' });
                setTimeout(() => {
                    navigate('/login');
                }, 5000);
            } else {
                setError(response.data.message || 'Error en el registro');
            }

        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error durante el registro');

        } finally {
            setLoading(false)
        }
    }





    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">Registrarse como Paciente</h2>

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
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="form-btn"
                        disabled={loading}
                    >
                        {loading ? 'Registrando...' : 'Registrarse como Paciente'}
                    </button>
                </form>

                <div className="form-link">
                    <p>
                        ¿Ya tienes una cuenta?  <Link to="/login">Inicia sesión aquí</Link>
                    </p>
                    <p className="mt-1">
                        ¿Quieres registrarte como médico? <Link to="/register-doctor">Haz clic aquí</Link>
                    </p>
                </div>
                
            </div>
        </div>
    );


}
export default Register;