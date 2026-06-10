/**
 * Toast notification for new badge awards
 */

import PropTypes from 'prop-types';

export default function BadgeToast({ badge }) {
  if (!badge) return null;
  return (
    <div className="badge-toast" role="alert" aria-live="assertive" aria-atomic="true">
      <span className="badge-toast-icon" aria-hidden="true">{badge.icon}</span>
      <div>
        <div className="badge-toast-title">Badge earned!</div>
        <div className="badge-toast-label">{badge.label}</div>
        <div className="badge-toast-desc">{badge.description}</div>
      </div>
    </div>
  );
}

BadgeToast.propTypes = {
  badge: PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }),
};
BadgeToast.defaultProps = { badge: null };
