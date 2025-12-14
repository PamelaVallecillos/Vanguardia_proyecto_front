
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import PasswordInput from '../components/PasswordInput';


const Login = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
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

        try {

            const response = await apiService.login(formData);

            // Log response for debugging token shape
            console.debug('Login response:', response?.data);

            if (response.data.statusCode === 200) {
                // Support several possible response shapes where token and roles may live
                const data = response.data.data || response.data;
                const token = data?.token || data?.accessToken || response.data?.token;
                const roles = data?.roles || data?.authorities || [];

                // Validate token looks like a compact JWT before saving
                if (typeof token === 'string' && (token.split('.').length - 1) === 2) {
                    apiService.saveAuthData(token, roles)
                    navigate('/home')
                } else {
                    console.warn('Received invalid token from login:', token);
                    setError('Login succeeded but no valid authentication token received.');
                }

            } else {
                setError(response.data.message || 'Error de inicio de sesión');
            }

        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error durante el inicio de sesión');

        } finally {
            setLoading(false)
        }
    }





    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">Iniciar sesión</h2>

                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label className="form-label">Email</label>
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

                    <button
                        type="submit"
                        className="form-btn"
                        disabled={loading}
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>


                <div className="form-link">
                    <p>
                        ¿No tienes una cuenta?{' '}
                        <Link to="/register">Regístrate como Paciente</Link> o{' '}
                        <Link to="/register-doctor">Regístrate como Doctor</Link>
                    </p>
                    <p>
                        ¿Olvidaste tu contraseña?{' '}
                        <Link to="/forgot-password">Restablecer contraseña aquí</Link>

                    </p>
                </div>

            </div>
        </div>
    );


}
export default Login;