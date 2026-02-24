import { Button } from '@/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import logoPrimaryAlt from '@/assets/logo-primary-alt.svg';
import styles from './SimpleHeader.module.css';

/**
 * SimpleHeader Component
 *
 * Minimal page header with a back navigation button and the MindSync logo.
 * Used on full-page flows that have no Navbar (auth pages, screening).
 *
 * Positioned absolutely so it floats over any full-viewport background.
 *
 * @param {Object} props
 * @param {string} [props.href='/'] - Link destination for the back button
 * @param {string} [props.label='Back to Home'] - Text label for the back button
 * @param {string} [props.className] - Extra CSS class applied to the header element
 */
function SimpleHeader({ href = '/', label = 'Back to Home', className }) {
  return (
    <div className={[styles.header, className].filter(Boolean).join(' ')}>
      <Button
        variant="outlined"
        theme="light"
        href={href}
        icon={<FontAwesomeIcon icon={faChevronLeft} />}
      >
        {label}
      </Button>
      <img src={logoPrimaryAlt} alt="MindSync" className={styles.logo} />
    </div>
  );
}

export default SimpleHeader;
