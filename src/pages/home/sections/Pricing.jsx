import { useState, useEffect, useRef } from 'react';
import styles from './Pricing.module.css';
import Button from '../../../components/button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faBolt, faInfinity, faBuilding } from '@fortawesome/free-solid-svg-icons';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    icon: faInfinity,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Everything you need to get started and stay on top of your finances.',
    cta: 'Get started free',
    ctaVariant: 'outline',
    featured: false,
    features: [
      'Up to 50 transactions / month',
      '3 budget categories',
      'Spending breakdown chart',
      'CSV export',
      'Dark mode',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: faBolt,
    monthlyPrice: 7,
    yearlyPrice: 5,
    description: 'For people serious about their money. Unlimited everything.',
    cta: 'Start free trial',
    ctaVariant: 'primary',
    featured: true,
    features: [
      'Unlimited transactions',
      'Unlimited budget categories',
      'Advanced charts & trends',
      'Recurring transaction detection',
      'Priority support',
      'Early access to new features',
    ],
  },
  {
    id: 'team',
    name: 'Team',
    icon: faBuilding,
    monthlyPrice: 18,
    yearlyPrice: 13,
    description: 'Shared finances for couples, families or small businesses.',
    cta: 'Contact us',
    ctaVariant: 'outline',
    featured: false,
    features: [
      'Everything in Pro',
      'Up to 5 members',
      'Shared budgets & goals',
      'Role-based permissions',
      'Dedicated account manager',
    ],
  },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const els = sectionRef.current?.querySelectorAll('[data-animate]');
    if (!els) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className={styles.section} id="pricing" ref={sectionRef}>
      <div className={styles.sectionBg} />

      <div className={styles.inner}>
        <div className={styles.header} data-animate>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Simple pricing
          </div>
          <h2 className={styles.headline}>
            Start free. Upgrade<br />
            <span className={styles.headlineAccent}>when you're ready.</span>
          </h2>
          <p className={styles.subheadline}>
            No hidden fees. Cancel anytime. Your data is always yours.
          </p>

          <div className={styles.toggle}>
            <span className={!yearly ? styles.toggleLabelActive : styles.toggleLabel}>Monthly</span>
            <button
              className={`${styles.toggleSwitch} ${yearly ? styles.toggleSwitchOn : ''}`}
              onClick={() => setYearly((v) => !v)}
              aria-label="Toggle billing period"
            >
              <span className={styles.toggleThumb} />
            </button>
            <span className={yearly ? styles.toggleLabelActive : styles.toggleLabel}>
              Yearly
              <span className={styles.saveBadge}>Save 30%</span>
            </span>
          </div>
        </div>

        <div className={styles.grid}>
          {PLANS.map((plan, i) => (
            <div
              key={plan.id}
              className={`${styles.card} ${plan.featured ? styles.cardFeatured : ''}`}
              data-animate
              style={{ '--delay': `${i * 0.1}s` }}
            >
              {plan.featured && (
                <div className={styles.featuredBadge}>Most popular</div>
              )}

              <div className={styles.cardTop}>
                <div className={styles.planIcon} data-featured={plan.featured}>
                  <FontAwesomeIcon icon={plan.icon} />
                </div>
                <div>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <p className={styles.planDescription}>{plan.description}</p>
                </div>
              </div>

              <div className={styles.priceRow}>
                <span className={styles.currency} key={`currency-${yearly}`}>$</span>
                <span
                  className={styles.price}
                  key={`price-${plan.id}-${yearly}`}
                >
                  {yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <div className={styles.priceMeta}>
                  <span className={styles.perMonth}>/ mo</span>
                  {yearly && plan.monthlyPrice > 0 && (
                    <span
                      className={styles.wasPrice}
                      key={`was-${plan.id}-${yearly}`}
                    >
                      ${plan.monthlyPrice}
                    </span>
                  )}
                </div>
              </div>

              <Button
                variant={plan.ctaVariant}
                size="medium"
                fullWidth
              >
                {plan.cta}
              </Button>

              <div className={styles.divider} />

              <ul className={styles.featureList}>
                {plan.features.map((f, j) => (
                  <li key={j} className={styles.featureItem}>
                    <span className={styles.checkIcon} data-featured={plan.featured}>
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.footer} data-animate style={{ '--delay': '0.4s' }}>
          <p className={styles.footerText}>
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </div>
    </section>
  );
}