import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const PasswordInput = ({ name, value, onChange, placeholder, required, minLength, className, id, disabled }) => {
    const [visible, setVisible] = useState(false);

    return (
        <div className="password-input-wrapper">
            <input
                id={id}
                name={name}
                type={visible ? 'text' : 'password'}
                className={className ? className : 'form-input'}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                disabled={disabled}
            />
            <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setVisible(v => !v)}
                aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                tabIndex={0}
            >
                {visible ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
        </div>
    );
};

export default PasswordInput;
