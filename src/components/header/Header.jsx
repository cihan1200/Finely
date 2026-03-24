import { useState } from 'react';
import styles from './Header.module.css';
import logoLight from '../../assests/logo-light.svg';
import logoDark from '../../assests/logo-dark.svg';
import { useTheme } from '../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faBars, faXmark, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import Button from '../button/Button';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Reviews', href: '#reviews' }
];

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('finely-user');
  window.location.href = '/';
}

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoggedIn = !!localStorage.getItem('token');

  const closeMenu = () => setMenuOpen(false);

  const handleNavClick = (e, href) => {
    if (!href.startsWith('#')) return;
    e.preventDefault();
    closeMenu();
    const target = document.querySelector(href);
    if (!target) return;
    const headerHeight = document.querySelector('[data-header]')?.offsetHeight ?? 80;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className={styles.wrapper} data-header>
      <div className={styles.header}>
        <a className={styles.brand} href="/">
          <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt="Finely"
          />
        </a>

        <nav className={styles.links}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={styles.navLink}
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
          {isLoggedIn && (
            <a href="/dashboard" className={styles.navLink}>
              Dashboard
            </a>
          )}
        </nav>

        <div className={styles.ctas}>
          {isLoggedIn ? (
            <Button variant='primary' onClick={logout}>
              <FontAwesomeIcon icon={faRightFromBracket} />Log out
            </Button>
          ) : (
            <>
              <a href="/signin" className={styles.ctaLogin}>Log in</a>
              <a href="/signup" className={styles.ctaSignin}>Get started</a>
            </>
          )}

          <button
            className={`${styles.themeSwitch} ${theme === 'dark' ? styles.active : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className={styles.switchThumb}>
              <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} />
            </div>
          </button>
        </div>

        <div className={styles.mobileRight}>
          <button
            className={`${styles.themeSwitch} ${theme === 'dark' ? styles.active : ''}`}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <div className={styles.switchThumb}>
              <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} />
            </div>
          </button>

          <button
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          <nav className={styles.mobileNav}>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={styles.mobileNavLink}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            ))}
            {isLoggedIn && (
              <a href="/dashboard" className={styles.mobileNavLink} onClick={closeMenu}>
                Dashboard
              </a>
            )}
          </nav>
          <div className={styles.mobileCtas}>
            {isLoggedIn ? (
              <Button variant='primary' onClick={logout}>
                <FontAwesomeIcon icon={faRightFromBracket} />Log out
              </Button>
            ) : (
              <>
                <a href="/signin" className={styles.mobileCtaLogin} onClick={closeMenu}>
                  Log in
                </a>
                <a href="/signup" className={styles.mobileCtaSignin} onClick={closeMenu}>
                  Get started
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}