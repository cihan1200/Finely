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

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('finely-sidebar-collapsed') === 'true'
  );
  const [mobileOpen, setMobileOpen] = useState(false);

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

          <div className={styles.userRow} data-tooltip="Alex Morgan">
            <div className={styles.avatar}>AM</div>
            {!collapsed && (
              <div className={styles.userMeta}>
                <span className={styles.userName}>Alex Morgan</span>
                <span className={styles.userEmail}>alex@example.com</span>
              </div>
            )}
            {!collapsed && (
              <button className={styles.logoutBtn}>
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}