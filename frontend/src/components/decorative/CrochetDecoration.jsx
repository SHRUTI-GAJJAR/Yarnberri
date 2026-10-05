export default function CrochetDecoration({ variant = 'yarnball', className = '' }) {
  return <div className={`crochet-decoration crochet-${variant} ${className}`.trim()} aria-hidden="true" />;
}
