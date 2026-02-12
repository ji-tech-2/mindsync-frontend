import { Dropdown, TextField } from '@/components';
import styles from './DateField.module.css';

const monthOptions = [
  { label: 'January', value: '01' },
  { label: 'February', value: '02' },
  { label: 'March', value: '03' },
  { label: 'April', value: '04' },
  { label: 'May', value: '05' },
  { label: 'June', value: '06' },
  { label: 'July', value: '07' },
  { label: 'August', value: '08' },
  { label: 'September', value: '09' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

/**
 * DateField Component
 * Three separate fields for day, month (dropdown), and year
 * Use this component for any date input that requires day, month, and year selection
 * @param {Object} props
 * @param {string} props.dayValue - Day value
 * @param {string} props.monthValue - Month value (01-12)
 * @param {string} props.yearValue - Year value
 * @param {Function} props.onDayChange - Day change handler
 * @param {Function} props.onMonthChange - Month change handler (receives dropdown option)
 * @param {Function} props.onYearChange - Year change handler
 * @param {Function} props.onDayBlur - Day blur handler
 * @param {Function} props.onMonthBlur - Month blur handler
 * @param {Function} props.onYearBlur - Year blur handler
 * @param {boolean} props.dayError - Day field error state
 * @param {boolean} props.monthError - Month field error state
 * @param {boolean} props.yearError - Year field error state
 * @param {boolean} props.dateError - General date error state (affects all fields)
 * @param {string} props.label - Label for the field group (default: "Select a date")
 */
const DateField = ({
  dayValue = '',
  monthValue = '',
  yearValue = '',
  onDayChange,
  onMonthChange,
  onYearChange,
  onDayBlur,
  onMonthBlur,
  onYearBlur,
  dayError = false,
  monthError = false,
  yearError = false,
  dateError = false,
  label = 'Select a date',
}) => {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label}>{label}</label>
      <div className={styles.fieldsGrid}>
        <TextField
          label="Day"
          type="text"
          name="dobDay"
          value={dayValue}
          onChange={onDayChange}
          onBlur={onDayBlur}
          maxLength={2}
          error={dayError || dateError}
        />
        <Dropdown
          label="Month"
          options={monthOptions}
          value={
            monthValue
              ? monthOptions.find((opt) => opt.value === monthValue)
              : null
          }
          onChange={onMonthChange}
          onBlur={onMonthBlur}
          fullWidth
          error={monthError || dateError}
        />
        <TextField
          label="Year"
          type="text"
          name="dobYear"
          value={yearValue}
          onChange={onYearChange}
          onBlur={onYearBlur}
          maxLength={4}
          error={yearError || dateError}
        />
      </div>
    </div>
  );
};

export default DateField;
