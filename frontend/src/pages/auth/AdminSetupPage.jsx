import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { setupAdminAccount } from '../../services/authService';

const getSetupError = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.message;

  if (status === 400 || status === 401 || status === 409) return message;
  if (status === 429) return 'Too many setup attempts. Please wait before trying again.';
  if (status === 503) return 'Admin setup is not configured on the server. Please contact the site administrator.';
  return 'Unable to create the admin account right now. Please try again later.';
};

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async ({ name, email, password, setupKey }) => {
    setServerError('');
    try {
      await setupAdminAccount({ name, email: email.trim(), password, setupKey });
    } catch (error) {
      setServerError(getSetupError(error) || 'Unable to create the admin account right now.');
      return;
    }

    try {
      const user = await login({ email: email.trim(), password });
      if (user?.role !== 'admin') {
        setServerError('Admin account created, but its admin access could not be confirmed. Please contact the site administrator.');
        return;
      }
      navigate('/admin/products', { replace: true });
    } catch (error) {
      setServerError('Admin account created, but automatic sign-in failed. Please sign in with your new credentials.');
    }
  };

  return (
    <section className="yb-section yb-auth-page yb-admin-setup-page">
      <div className="container">
        <div className="yb-auth-card">
          <p className="yb-eyebrow"><KeyRound size={14} aria-hidden="true" /> Store owner account</p>
          <h1>Admin setup</h1>
          <p className="yb-auth-intro">Create the Yarnberri store-owner account using your private setup key.</p>

          {serverError && <p className="yb-page-alert yb-admin-setup-error" role="alert" aria-live="polite">{serverError}</p>}

          <form onSubmit={handleSubmit(onSubmit)} className="yb-form-grid one-column" noValidate>
            <label>
              <span>Admin name</span>
              <input
                {...register('name', {
                  required: 'Please enter your name.',
                  minLength: { value: 2, message: 'Name must have at least 2 characters.' },
                  maxLength: { value: 50, message: 'Name must be 50 characters or fewer.' },
                })}
                type="text"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'admin-setup-name-error' : undefined}
              />
              {errors.name && <small className="yb-field-error" id="admin-setup-name-error">{errors.name.message}</small>}
            </label>

            <label>
              <span>Admin email</span>
              <input
                {...register('email', {
                  required: 'Please enter your email address.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
                })}
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'admin-setup-email-error' : undefined}
              />
              {errors.email && <small className="yb-field-error" id="admin-setup-email-error">{errors.email.message}</small>}
            </label>

            <label>
              <span>Password</span>
              <input
                {...register('password', {
                  required: 'Please create a password.',
                  minLength: { value: 8, message: 'Use at least 8 characters.' },
                })}
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'admin-setup-password-error' : undefined}
              />
              {errors.password && <small className="yb-field-error" id="admin-setup-password-error">{errors.password.message}</small>}
            </label>

            <label>
              <span>Confirm password</span>
              <input
                {...register('confirmPassword', {
                  required: 'Please confirm your password.',
                  validate: (value) => value === getValues('password') || 'Passwords do not match.',
                })}
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? 'admin-setup-confirm-error' : undefined}
              />
              {errors.confirmPassword && <small className="yb-field-error" id="admin-setup-confirm-error">{errors.confirmPassword.message}</small>}
            </label>

            <label>
              <span>Admin setup key</span>
              <input
                {...register('setupKey', { required: 'Please enter your admin setup key.' })}
                type="password"
                autoComplete="off"
                aria-invalid={Boolean(errors.setupKey)}
                aria-describedby={errors.setupKey ? 'admin-setup-key-error' : undefined}
              />
              {errors.setupKey && <small className="yb-field-error" id="admin-setup-key-error">{errors.setupKey.message}</small>}
            </label>

            <button type="submit" className="yb-btn yb-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating admin account...' : 'Create admin account'}
            </button>
          </form>

          <p className="yb-auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
