import { useState } from 'react';
import styles from './Sidebar.module.css';
import { useTheme } from '../../../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoDark from "../../../assests/logo-dark.svg";
import logoLight from "../../../assests/logo-light.svg";
import {
  faTableColumns,
  faArrowRightArrowLeft,
  faChartPie,
  faBullseye,
  faFileExport,
  faGear,
  faSun,
  faMoon,
  faRightFromBracket,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: faTableColumns, href: '/dashboard' },
  { label: 'Transactions', icon: faArrowRightArrowLeft, href: '/transactions' },
  { label: 'Analytics', icon: faChartPie, href: '/analytics' },
  { label: 'Budgets', icon: faBullseye, href: '/budgets' },
  { label: 'Export', icon: faFileExport, href: '#' },
];

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: faGear, href: '#' },
];

function parseJwt(token) {
  try {
    // 1. base64url → base64
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    // 2. Decode to a byte array and parse as UTF-8 (handles all Unicode)
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return {};
  }
}

function getUser() {
  // Preferred: explicit user object stored at sign-in
  try {
    const raw = localStorage.getItem('finely-user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.name || parsed.email) return parsed;
    }
  } catch {
    // fall through
  }

  // Fallback: decode the JWT that is already in localStorage
  try {
    const token = localStorage.getItem('token');
    if (token) {
      const { firstName, lastName, email } = parseJwt(token);
      const name = [firstName, lastName].filter(Boolean).join(' ');
      if (name || email) {
        localStorage.setItem('finely-user', JSON.stringify({ name, email: email || '' }));
      }
      return { name, email: email || '' };
    }
  } catch {
    // fall through
  }

  return { name: '', email: '' };
}

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('finely-user');
  window.location.href = '/';
}

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('finely-sidebar-collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = getUser();
  const initials = getInitials(user.name) || '?';

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem('finely-sidebar-collapsed', next);
      return next;
    });
    setMobileOpen(false);
  };

  const pathname = window.location.pathname;
  const isActive = (href) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      <button className={styles.mobileToggle} onClick={() => setMobileOpen(true)}>
        <FontAwesomeIcon icon={faBars} />
      </button>

      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarTop}>
          {!collapsed && (
            <a href="/">
              <img
                src={theme === 'dark' ? logoDark : logoLight}
                alt="Finely"
                className={styles.logoImg}
              />
            </a>
          )}
          <button className={styles.collapseBtn} onClick={toggleCollapsed}>
            <FontAwesomeIcon icon={collapsed ? faBars : faXmark} />
          </button>
        </div>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`}
                  data-tooltip={item.label}
                >
                  <span className={styles.navIcon}>
                    <FontAwesomeIcon icon={item.icon} />
                  </span>
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarBottom}>
          {BOTTOM_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={styles.navItem}
              data-tooltip={item.label}
            >
              <span className={styles.navIcon}>
                <FontAwesomeIcon icon={item.icon} />
              </span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </a>
          ))}

          <button
            className={styles.navItem}
            onClick={toggleTheme}
            data-tooltip="Toggle theme"
          >
            <span className={styles.navIcon}>
              <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
            </span>
            {!collapsed && <span className={styles.navLabel}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          </button>

          <div className={styles.divider} />

          <div className={styles.userRow} data-tooltip={user.name || 'Account'}>
            <div className={styles.avatar}>{initials}</div>
            {!collapsed && (
              <div className={styles.userMeta}>
                <span className={styles.userName}>{user.name || 'Unknown user'}</span>
                <span className={styles.userEmail}>{user.email || ''}</span>
              </div>
            )}
            {!collapsed && (
              <button className={styles.logoutBtn} onClick={logout} aria-label="Log out">
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            )}
          </div>

          {collapsed && (
            <button
              className={styles.navItem}
              onClick={logout}
              data-tooltip="Log out"
            >
              <span className={`${styles.navIcon} ${styles.navIconDanger}`}>
                <FontAwesomeIcon icon={faRightFromBracket} />
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}