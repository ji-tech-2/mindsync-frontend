import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXTwitter,
  faInstagram,
  faTiktok,
} from '@fortawesome/free-brands-svg-icons';
import styles from './Footer.module.css';

/**
 * Footer Component
 *
 * Displays:
 * - Social media links with FontAwesome icons
 * - Copyright information
 * - Dark theme with system colors
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      url: 'https://twitter.com',
      icon: faXTwitter,
      label: 'X (Twitter)',
    },
    {
      url: 'https://instagram.com',
      icon: faInstagram,
      label: 'Instagram',
    },
    {
      url: 'https://tiktok.com',
      icon: faTiktok,
      label: 'TikTok',
    },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Social Media Links */}
        <div className={styles.socialIcons}>
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label={link.label}
            >
              <FontAwesomeIcon icon={link.icon} />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          Copyright © {currentYear} JI-TECH. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
