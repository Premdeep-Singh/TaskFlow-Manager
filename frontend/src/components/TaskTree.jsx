import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { STATUSES, fmtDate, isOverdue } from '../ui.jsx';

function Row({ task, byParent, depth, role, onChange, onAddSubtask, onError }) {
  const { user } = useAuth();
  const [ideas, setIdeas] = useState(null);
  const [thinking, setThinking] = useState(false);
  const kids = byParent[task.id] || [];
  const canUpdate = role !== 'JUNIOR' || task.assigneeId === user.id;
  const canDelete = role === 'LEADER' || task.createdBy === user.id;

  const act = async (fn) => { try { await fn(); onChange(); } catch (e) { onError(e.message); } };

  const suggest = async () => {
    setThinking(true);
    try { setIdeas(await api.post('/ai/subtasks', { title: task.title, description: task.description })); }
    catch (e) { onError(e.message); }
    finally { setThinking(false); }
  };

  const addAll = () => act(async () => {
    await Promise.all(ideas.map((title) => api.post('/tasks', {
      projectId: task.projectId, parentTaskId: task.id, title, priority: 'MEDIUM', assigneeId: user.id,
    })));
    setIdeas(null);
  });

  return (
    <li>
      <div className={`task ${task.status === 'DONE' ? 'done' : ''}`} style={{ marginLeft: depth * 22 }}>
        <select aria-label="Status" className={`status s-${task.status}`} value={task.status} disabled={!canUpdate}
          onChange={(e) => act(() => api.patch(`/tasks/${task.id}/status`, { status: e.target.value }))}>
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="grow">
          <span className="title">{task.title}</span>
          <span className="meta">
            {task.assigneeName} · <span className={isOverdue(task) ? 'late' : ''}>{fmtDate(task.dueDate)}</span> · {task.priority.toLowerCase()}
          </span>
        </div>
        <button className="ghost small" onClick={() => onAddSubtask(task)}>Subtask</button>
        {depth === 0 && <button className="ghost small" onClick={suggest} disabled={thinking}>{thinking ? 'Thinking…' : 'Suggest subtasks'}</button>}
        {canDelete && <button className="ghost small danger" aria-label={`Delete ${task.title}`}
          onClick={() => window.confirm(`Delete "${task.title}" and its subtasks?`) && act(() => api.del(`/tasks/${task.id}`))}>Delete</button>}
      </div>
      {ideas && (
        <div className="ideas" style={{ marginLeft: depth * 22 + 12 }}>
          <strong>Suggested subtasks</strong>
          <ul>{ideas.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <div className="actions">
            <button className="ghost small" onClick={() => setIdeas(null)}>Dismiss</button>
            <button className="primary small" onClick={addAll}>Add all as my subtasks</button>
          </div>
        </div>
      )}
      {kids.length > 0 && (
        <ul>{kids.map((k) => <Row key={k.id} task={k} byParent={byParent} depth={depth + 1} role={role}
          onChange={onChange} onAddSubtask={onAddSubtask} onError={onError} />)}</ul>
      )}
    </li>
  );
}

/** Renders a project's tasks as a tree: tasks with their nested subtasks. */
export default function TaskTree({ tasks, role, onChange, onAddSubtask, onError }) {
  const byParent = {};
  tasks.forEach((t) => { (byParent[t.parentTaskId || 'root'] ||= []).push(t); });
  const roots = byParent.root || [];
  return (
    <ul className="tree">
      {roots.map((t) => <Row key={t.id} task={t} byParent={byParent} depth={0} role={role}
        onChange={onChange} onAddSubtask={onAddSubtask} onError={onError} />)}
    </ul>
  );
}
