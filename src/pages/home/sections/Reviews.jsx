import { useEffect, useRef, useState } from 'react';
import styles from './Reviews.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStar,
  faQuoteRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

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
  { target: 4.9,   format: (v) => v.toFixed(1),                          label: 'Average rating' },
  { target: 98,    format: (v) => `${Math.round(v)}%`,                   label: 'Would recommend' },
  { target: 5,     format: (v) => `< ${Math.round(v)} min`,              label: 'To get started' },
];

const FEATURED = REVIEWS.filter((r) => r.featured);
const MARQUEE_A = [...REVIEWS, ...REVIEWS];
const MARQUEE_B = [...[...REVIEWS].reverse(), ...[...REVIEWS].reverse()];

export default function Reviews() {
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  const startCycle = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActive((p) => (p + 1) % FEATURED.length);
    }, 8000);
  };

  useEffect(() => {
    startCycle();
    return () => clearInterval(intervalRef.current);
  }, []);

  const goTo = (i) => {
    setActive(i);
    startCycle();
  };

  const prev = () => goTo((active - 1 + FEATURED.length) % FEATURED.length);
  const next = () => goTo((active + 1) % FEATURED.length);

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

  return (
    <section className={styles.section} id="reviews" ref={sectionRef}>
      <div className={styles.sectionBg} />

      <div className={styles.inner}>
        <div className={styles.header} data-animate>
          <div className={styles.eyebrow}>Real people, real results</div>
          <h2 className={styles.headline}>
            Loved by people who{' '}
            <span className={styles.headlineAccent}>finally get it.</span>
          </h2>
          <p className={styles.subheadline}>
            No incentivised reviews. Just people who found something that works.
          </p>
        </div>

        <div className={styles.statsStrip} data-animate style={{ '--delay': '0.1s' }}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statItem}>
              <CountUp target={s.target} format={s.format} />
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.spotlight} data-animate style={{ '--delay': '0.2s' }}>
          <div className={styles.spotlightGlow} />

          <div className={styles.spotlightQuoteIcon} aria-hidden>
            <FontAwesomeIcon icon={faQuoteRight} />
          </div>

          <div className={styles.slides}>
            {FEATURED.map((r, i) => (
              <div
                key={r.name}
                className={`${styles.slide} ${i === active ? styles.slideActive : ''}`}
                aria-hidden={i !== active}
              >
                <p className={styles.slideText}>{r.text}</p>
                <div className={styles.slideFooter}>
                  <div className={styles.slideAvatar} data-color={r.color}>
                    {r.initials}
                  </div>
                  <div className={styles.slideMeta}>
                    <span className={styles.slideName}>{r.name}</span>
                    <span className={styles.slideRole}>{r.role}</span>
                  </div>
                  <div className={styles.slideStars}>
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <FontAwesomeIcon key={j} icon={faStar} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.progressTrack}>
            <div className={styles.progressBar} key={active} />
          </div>

          <div className={styles.spotlightNav}>
            <div className={styles.dots}>
              {FEATURED.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={`Review ${i + 1}`}
                />
              ))}
            </div>
            <div className={styles.arrows}>
              <button className={styles.arrowBtn} onClick={prev} aria-label="Previous">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className={styles.arrowBtn} onClick={next} aria-label="Next">
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.marqueeSection} data-animate style={{ '--delay': '0.3s' }}>
        <MarqueeRow items={MARQUEE_A} duration={65} />
        <MarqueeRow items={MARQUEE_B} duration={50} reverse />
      </div>
    </section>
  );
}

function MarqueeRow({ items, duration, reverse = false }) {
  return (
    <div className={styles.marqueeViewport}>
      <div
        className={`${styles.marqueeTrack} ${reverse ? styles.marqueeReverse : ''}`}
        style={{ '--dur': `${duration}s` }}
      >
        {items.map((r, i) => (
          <MarqueeCard key={i} review={r} />
        ))}
      </div>
    </div>
  );
}

function MarqueeCard({ review }) {
  return (
    <div className={styles.mCard}>
      <div className={styles.mStars}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <FontAwesomeIcon key={i} icon={faStar} className={styles.mStar} />
        ))}
      </div>
      <p className={styles.mText}>{review.text}</p>
      <div className={styles.mAuthor}>
        <div className={styles.mAvatar} data-color={review.color}>
          {review.initials}
        </div>
        <div className={styles.mMeta}>
          <span className={styles.mName}>{review.name}</span>
          <span className={styles.mRole}>{review.role}</span>
        </div>
      </div>
    </div>
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
          const progress = Math.min((now - startTime) / duration, 1);
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