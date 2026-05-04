import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      className={`btn btn--${variant} btn--${size} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="btn__icon btn__icon--left">{icon}</span>}
          <span className="btn__label">{children}</span>
          {icon && iconPosition === 'right' && <span className="btn__icon btn__icon--right">{icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;