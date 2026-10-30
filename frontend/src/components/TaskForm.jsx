import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { Modal, PRIORITIES, roleIn } from '../ui.jsx';

/**
 * Add task form. Pass `parentTask` to add a subtask (project is then fixed).
 * The assignee list follows the role rules: leaders pick anyone, seniors pick
 * themselves or juniors, juniors can only assign to themselves.
 */
export default function TaskForm({ projects, teams, presetProjectId, parentTask, onDone, onClose }) {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState(parentTask?.projectId || presetProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assigneeId, setAssigneeId] = useState(String(user.id));
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const team = teams.find((t) => t.id === project?.teamId);
  const role = roleIn(team, user.id);
  const candidates = (team?.members || []).filter(
    (m) => role === 'LEADER' || m.userId === user.id || (role === 'SENIOR' && m.role === 'JUNIOR')
  );

  const changeProject = (id) => { setProjectId(id); setAssigneeId(String(user.id)); };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/tasks', {
        projectId, parentTaskId: parentTask?.id || null, title, description, priority,
        assigneeId: Number(assigneeId), dueDate: dueDate || null,
      });
      onDone();
    } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <Modal title={parentTask ? `Add subtask to "${parentTask.title}"` : 'Add task'} onClose={onClose}>
      {projects.length === 0 ? (
        <p className="hint">You need a project first. A team leader can create one on the My projects page.</p>
      ) : (
        <form onSubmit={submit}>
          {!parentTask && (
            <label>Project
              <select value={projectId} onChange={(e) => changeProject(e.target.value)}>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.teamName})</option>)}
              </select>
            </label>
          )}
          <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus /></label>
          <label>Details<textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} /></label>
          <div className="row">
            <label>Assign to
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
                {candidates.map((m) => <option key={m.userId} value={m.userId}>{m.userId === user.id ? 'Me' : m.name}</option>)}
              </select>
            </label>
            <label>Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <label>Due date<input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="actions">
            <button type="button" className="ghost" onClick={onClose}>Cancel</button>
            <button className="primary" disabled={busy}>Add task</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
