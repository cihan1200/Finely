import { useEffect, useRef } from 'react';
import styles from './Footer.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../contexts/ThemeContext';
import logoDark from '../../assests/logo-dark.svg';
import logoLight from '../../assests/logo-light.svg';

const LINKS = [
  {
    heading: 'Product',
    items: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
    ],
  },
  {
    heading: 'Company',
    items: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press kit', href: '#' },
    ],
  },
  {
    heading: 'Legal',
    items: [
      { label: 'Privacy policy', href: '#' },
      { label: 'Terms of service', href: '#' },
      { label: 'Cookie policy', href: '#' },
      { label: 'Security', href: '#' },
    ],
  },
];

const SOCIALS = [
  { icon: faGithub, href: '#', label: 'GitHub' },
  { icon: faXTwitter, href: '#', label: 'X' },
  { icon: faLinkedin, href: '#', label: 'LinkedIn' },
];

export default function Footer() {
  const { theme } = useTheme();
  const footerRef = useRef(null);

  useEffect(() => {
    const els = footerRef.current?.querySelectorAll('[data-animate]');
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
    <footer className={styles.footer} ref={footerRef}>
      <div className={styles.footerBg}>
        <div className={styles.dotGrid} />
      </div>

      <div className={styles.inner}>
        <div className={styles.cta} data-animate>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaHeadline}>
              Ready to get <span className={styles.ctaAccent}>Finely</span> in control?
            </h2>
            <p className={styles.ctaSub}>
              Join thousands of people who stopped guessing and started knowing.
            </p>
          </div>
          <a href="/register" className={styles.ctaBtn}>
            Get started free
            <FontAwesomeIcon icon={faArrowRight} />
          </a>
        </div>

        <div className={styles.divider} />

        <div className={styles.main}>
          <div className={styles.brand} data-animate style={{ '--delay': '0.05s' }}>
            <a href="/" className={styles.logoLink}>
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Finely"
                className={styles.logo}
              />
            </a>
            <p className={styles.brandDesc}>
              Your money, finally clear. Track income, expenses and budgets in one beautifully simple dashboard.
            </p>
            <div className={styles.socials}>
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className={styles.socialLink}
                  aria-label={s.label}
                >
                  <FontAwesomeIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>

          <div className={styles.linkGroups}>
            {LINKS.map((group, i) => (
              <div
                key={group.heading}
                className={styles.linkGroup}
                data-animate
                style={{ '--delay': `${0.1 + i * 0.07}s` }}
              >
                <span className={styles.groupHeading}>{group.heading}</span>
                <ul className={styles.linkList}>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <a href={item.href} className={styles.link}>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom} data-animate style={{ '--delay': '0.3s' }}>
          <span className={styles.copyright}>
            © {new Date().getFullYear()} Finely. All rights reserved.
          </span>
          <span className={styles.madeWith}>
            Built with care for people who care about money.
          </span>
        </div>
      </div>
    </footer>
  );
}