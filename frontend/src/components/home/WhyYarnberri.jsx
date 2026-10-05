import { Gift, Heart, Sparkles, Wand2 } from 'lucide-react';

const features = [
  {
    title: 'Handmade with love',
    description: 'Every piece is crafted thoughtfully, slowly, and with a little extra care.',
    icon: Heart,
  },
  {
    title: 'Designed to gift',
    description: 'Cute, meaningful pieces that feel personal and ready to delight.',
    icon: Gift,
  },
  {
    title: 'Soft little details',
    description: 'From texture to color, each choice is chosen to feel warm and charming.',
    icon: Wand2,
  },
  {
    title: 'Made for happy moments',
    description: 'A delightful touch for homes, celebrations, and everyday joy.',
    icon: Sparkles,
  },
];

export default function WhyYarnberri() {
  return (
    <section className="yb-section yb-brand-section">
      <div className="container">
        <div className="yb-section-heading">
          <div className="yb-eyebrow">Why Yarnberri</div>
          <h2 className="yb-section-title">Little pieces with a lot of heart</h2>
        </div>

        <div className="row g-4">
          {features.map(({ title, description, icon: Icon }) => (
            <div key={title} className="col-md-6 col-xl-3">
              <div className="yb-feature-card">
                <div className="yb-feature-icon">
                  <Icon size={22} />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
