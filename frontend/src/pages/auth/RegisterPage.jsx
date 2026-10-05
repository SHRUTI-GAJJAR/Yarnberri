import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser } = useAuth();
  const { notify } = useNotifications();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      notify('Registration request sent. Please log in to continue.', 'success');
      const redirect = searchParams.get('redirect');
      navigate(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to create your account right now.', 'error');
    }
  };

  return (
    <section className="yb-section yb-auth-page">
      <div className="container">
        <div className="yb-auth-card">
          <p className="yb-eyebrow">A little welcome</p>
          <h1>Create your account</h1>
          <p className="yb-auth-intro">Save your details and keep your handmade orders close.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="yb-form-grid" noValidate>
            <label>
              <span>Full name</span>
              <input
                {...register('name', { required: 'Enter your name.', minLength: { value: 2, message: 'Your name must have at least 2 characters.' } })}
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'register-name-error' : undefined}
              />
              {errors.name && <small className="yb-field-error" id="register-name-error">{errors.name.message}</small>}
            </label>
            <label>
              <span>Email</span>
              <input
                {...register('email', {
                  required: 'Enter your email address.',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address.' },
                })}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
              />
              {errors.email && <small className="yb-field-error" id="register-email-error">{errors.email.message}</small>}
            </label>
            <label className="wide">
              <span>Password</span>
              <input
                {...register('password', { required: 'Create a password.', minLength: { value: 8, message: 'Use at least 8 characters.' } })}
                type="password"
                placeholder="At least 8 characters"
                autoComplete="new-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'register-password-error' : undefined}
              />
              {errors.password && <small className="yb-field-error" id="register-password-error">{errors.password.message}</small>}
            </label>
            <button type="submit" className="yb-btn yb-btn-primary wide" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="yb-auth-switch">
            Already have an account? <Link to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}>Sign in</Link>
          </p>
          <p className="yb-auth-switch yb-admin-setup-entry">
            Are you the store owner? <Link to="/admin/setup">Admin setup</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
