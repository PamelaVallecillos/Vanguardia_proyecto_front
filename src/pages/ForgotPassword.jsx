import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';


const ForgotPassword = () => {

    const [formData, setFormData] = useState({
        email: ''
    });


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');


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
            const response = await apiService.forgetPassword(formData);

            if (response.data.statusCode === 200) {
                setSuccess('¡Las instrucciones para restablecer la contraseña han sido enviadas a tu correo electrónico!');
                setFormData({ email: '' });
            } else {
                setError(response.data.message || 'No se pudieron enviar las instrucciones de restablecimiento');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Ocurrió un error al procesar tu solicitud');
        } finally {
            setLoading(false);
        }
    };





    return (
        <div className="container">
            <div className="form-container">
                <h2 className="form-title">Olvidé mi contraseña</h2>

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
                        <label className="form-label">Correo Electrónico</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Ingrese su correo electrónico registrado"
                            required
                        />
                        <small className="form-help">
                            Ingrese su dirección de correo electrónico y le enviaremos instrucciones para restablecer su contraseña.
                        </small>
                    </div>

                    <button
                        type="submit"
                        className="form-btn"
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : 'Enviar instrucciones de restablecimiento'}
                    </button>
                </form>

                <div className="form-link">
                    <p>
                        ¿Recuerdas tu contraseña? <Link to="/login">Volver a iniciar sesión</Link>
                    </p>
                    <p className="mt-1">
                        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
                    </p>
                </div>

                {/* Additional Help Information */}
                <div className="forgot-password-help">
                    <h4>¿Qué sucede después?</h4>
                    <ul>
                        <li>Revisa tu correo electrónico para un enlace de restablecimiento de contraseña</li>
                        <li>El código de restablecimiento expirará después de un cierto período</li>
                        <li>Si no ves el correo electrónico, revisa tu carpeta de spam</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
export default ForgotPassword;