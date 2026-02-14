import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components';

/**
 * BackButton Component
 * Icon-only back button using FontAwesome
 *
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional CSS classes
 */
function BackButton({ onClick, className = '', ...rest }) {
  return (
    <Button
      type="button"
      variant="outlined"
      iconOnly
      onClick={onClick}
      icon={<FontAwesomeIcon icon={faChevronLeft} />}
      className={className}
      {...rest}
    />
  );
}

export default BackButton;
