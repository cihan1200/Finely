import { useEffect, useRef, useState } from 'react';
import styles from './Reviews.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

const REVIEWS = [
  {
    name: 'Sarah Chen',
    role: 'Freelance Designer',
    initials: 'SC',
    color: 'emerald',
    rating: 5,
    text: "I've tried every budgeting app out there. Finely is the first one that didn't make me feel like I was doing my taxes. It just works.",
    featured: true,
  },
  {
    name: 'Marcus Webb',
    role: 'Software Engineer',
    initials: 'MW',
    color: 'blue',
    rating: 5,
    text: 'The dashboard mockup on the landing page looked almost too good. Then I actually used it and it was exactly that. Rare.',
  },
  {
    name: 'Amara Osei',
    role: 'Product Manager',
    initials: 'AO',
    color: 'amber',
    rating: 5,
    text: 'Budget alerts saved me from overspending on food three times this month. Embarrassing to admit but honestly a lifesaver.',
  },
  {
    name: 'Jonas Müller',
    role: 'Startup Founder',
    initials: 'JM',
    color: 'red',
    rating: 5,
    text: "Dark mode is perfect. I check this at midnight more than I should. Clean, fast, no bloat — exactly what I wanted.",
    featured: true,
  },
  {
    name: 'Priya Nair',
    role: 'Data Analyst',
    initials: 'PN',
    color: 'emerald',
    rating: 5,
    text: 'The CSV export made my accountant very happy. And the spending charts are genuinely beautiful — I showed them to my team.',
  },
  {
    name: 'Tom Reeves',
    role: 'Teacher',
    initials: 'TR',
    color: 'blue',
    rating: 5,
    text: "Finally got my finances under control after years of telling myself I'd do it. Took about 10 minutes to set up and I was hooked.",
  },
  {
    name: 'Lena Kovács',
    role: 'UX Researcher',
    initials: 'LK',
    color: 'amber',
    rating: 5,
    text: 'As someone who thinks about UX all day, I can say the attention to detail here is exceptional. Every interaction is considered.',
    featured: true,
  },
  {
    name: 'David Park',
    role: 'Consultant',
    initials: 'DP',
    color: 'red',
    rating: 5,
    text: 'Switched from a spreadsheet I had been maintaining for 4 years. No regrets. The category system alone is worth it.',
  },
];

const STATS = [
  { target: 12000, format: (v) => `${Math.round(v).toLocaleString()}+`, label: 'Happy users' },
  { target: 4.9, format: (v) => `${v.toFixed(1)} / 5`, label: 'Average rating' },
  { target: 98, format: (v) => `${Math.round(v)}%`, label: 'Would recommend' },
  { target: 5, format: (v) => `< ${Math.round(v)} min`, label: 'To get started' },
];

export default function Reviews() {
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
      { threshold: 0.08 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const col1 = REVIEWS.filter((_, i) => i % 3 === 0);
  const col2 = REVIEWS.filter((_, i) => i % 3 === 1);
  const col3 = REVIEWS.filter((_, i) => i % 3 === 2);

  return (
    <section className={styles.section} id="reviews" ref={sectionRef}>
      <div className={styles.sectionBg} />

      <div className={styles.inner}>
        <div className={styles.header} data-animate>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            Real people, real results
          </div>
          <h2 className={styles.headline}>
            Loved by people who<br />
            <span className={styles.headlineAccent}>finally get it.</span>
          </h2>
          <p className={styles.subheadline}>
            No incentivised reviews. Just people who found something that works.
          </p>
        </div>

        <div className={styles.statsRow} data-animate style={{ '--delay': '0.1s' }}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statItem}>
              <CountUp target={s.target} format={s.format} />
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.masonry}>
          <div className={styles.masonryCol}>
            {col1.map((r, i) => (
              <ReviewCard key={r.name} review={r} delay={i * 0.08} />
            ))}
          </div>
          <div className={styles.masonryCol}>
            {col2.map((r, i) => (
              <ReviewCard key={r.name} review={r} delay={0.08 + i * 0.08} />
            ))}
          </div>
          <div className={styles.masonryCol}>
            {col3.map((r, i) => (
              <ReviewCard key={r.name} review={r} delay={0.16 + i * 0.08} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CountUp({ target, format, duration = 1800 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        const startTime = performance.now();
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);

        const tick = (now) => {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          setValue(easeOut(progress) * target);
          if (progress < 1) requestAnimationFrame(tick);
          else setValue(target);
        };

        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span className={styles.statValue} ref={ref}>
      {format(value)}
    </span>
  );
}

function ReviewCard({ review, delay }) {
  return (
    <div
      className={`${styles.card} ${review.featured ? styles.cardFeatured : ''}`}
      data-animate
      style={{ '--delay': `${delay}s` }}
    >
      {review.featured && (
        <div className={styles.quoteIcon}>
          <FontAwesomeIcon icon={faQuoteLeft} />
        </div>
      )}

      <div className={styles.stars}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <FontAwesomeIcon key={i} icon={faStar} className={styles.star} />
        ))}
      </div>

      <p className={styles.reviewText}>{review.text}</p>

      <div className={styles.reviewer}>
        <div className={styles.avatar} data-color={review.color}>
          {review.initials}
        </div>
        <div className={styles.reviewerMeta}>
          <span className={styles.reviewerName}>{review.name}</span>
          <span className={styles.reviewerRole}>{review.role}</span>
        </div>
      </div>
    </div>
  );
}