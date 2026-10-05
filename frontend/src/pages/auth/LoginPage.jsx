import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { notify } = useNotifications();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      notify('Login successful. Welcome back to Yarnberri.', 'success');
      const requestedRedirect = searchParams.get('redirect') || '';
      const redirect = requestedRedirect.startsWith('/') &&
        !requestedRedirect.startsWith('//') &&
        !requestedRedirect.startsWith('/login')
        ? requestedRedirect
        : '/account';
      navigate(redirect, { replace: true });
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to sign in right now.', 'error');
    }
  };

  return (
    <section className="yb-section yb-auth-page">
      <div className="container">
        <div className="yb-auth-card">
          <p className="yb-eyebrow">Welcome back</p>
          <h1>Sign in to Yarnberri</h1>
          <p className="yb-auth-intro">Your handmade favourites are just around the corner.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="yb-form-grid one-column" noValidate>
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
                aria-describedby={errors.email ? 'login-email-error' : undefined}
              />
              {errors.email && <small className="yb-field-error" id="login-email-error">{errors.email.message}</small>}
            </label>
            <label>
              <span>Password</span>
              <input
                {...register('password', { required: 'Enter your password.' })}
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
              />
              {errors.password && <small className="yb-field-error" id="login-password-error">{errors.password.message}</small>}
            </label>
            <button type="submit" className="yb-btn yb-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="yb-auth-switch">
            New to Yarnberri? <Link to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`}>Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
