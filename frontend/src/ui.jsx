import { useEffect } from 'react';

export const STATUSES = [['TODO', 'To do'], ['IN_PROGRESS', 'In progress'], ['DONE', 'Done']];
export const PRIORITIES = [['LOW', 'Low'], ['MEDIUM', 'Medium'], ['HIGH', 'High']];
export const ROLE_LABEL = { LEADER: 'Team leader', SENIOR: 'Senior member', JUNIOR: 'Junior member' };

export const roleIn = (team, userId) => team?.members.find((m) => m.userId === userId)?.role;
export const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'No date';
export const isOverdue = (t) => t.dueDate && t.status !== 'DONE' && new Date(t.dueDate + 'T23:59:59') < new Date();

export const RoleTag = ({ role }) => (
  <span className={`role role-${role.toLowerCase()}`}>{ROLE_LABEL[role]}</span>
);

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
        </header>
        {children}
      </div>
    </div>
  );
}
