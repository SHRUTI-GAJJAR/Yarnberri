export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 text-center text-muted">
      <div className="spinner-border text-pink-400" role="status" aria-live="polite" style={{ width: '3rem', height: '3rem' }} />
      <span className="mt-3">{label}</span>
    </div>
  );
}
