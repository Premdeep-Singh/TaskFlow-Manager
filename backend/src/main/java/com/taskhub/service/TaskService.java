package com.taskhub.service;

import com.taskhub.model.*;
import com.taskhub.repo.mongo.TaskRepo;
import com.taskhub.web.ApiException;
import com.taskhub.web.Dtos.TaskReq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Role rules
 *  LEADER : create tasks for anyone, change any status, delete any task
 *  SENIOR : create tasks for themselves or juniors, change any status, delete their own tasks
 *  JUNIOR : create tasks for themselves, change status only on tasks assigned to them
 */
@Service
@RequiredArgsConstructor
public class TaskService {
    private final TaskRepo tasks;
    private final ProjectService projects;
    private final TeamService teams;

    public Task create(Long uid, TaskReq r) {
        Project p = projects.get(uid, r.projectId());
        Team team = teams.get(p.getTeamId());
        Role role = teams.roleOf(team, uid);

        if (r.parentTaskId() != null && !r.parentTaskId().isBlank()) {
            Task parent = tasks.findById(r.parentTaskId()).orElseThrow(() -> new ApiException(404, "Parent task not found"));
            if (!parent.getProjectId().equals(p.getId())) throw new ApiException(400, "Parent task belongs to another project");
        }

        Long assigneeId = r.assigneeId() == null ? uid : r.assigneeId();
        Team.Member assignee = team.getMembers().stream().filter(m -> m.userId().equals(assigneeId)).findFirst()
                .orElseThrow(() -> new ApiException(400, "That person is not on this team"));
        boolean allowed = switch (role) {
            case LEADER -> true;
            case SENIOR -> assigneeId.equals(uid) || assignee.role() == Role.JUNIOR;
            case JUNIOR -> assigneeId.equals(uid);
        };
        if (!allowed) throw new ApiException(403, "Your role can't assign tasks to " + assignee.name());

        Task t = new Task();
        t.setProjectId(p.getId());
        t.setTeamId(team.getId());
        t.setParentTaskId(r.parentTaskId() == null || r.parentTaskId().isBlank() ? null : r.parentTaskId());
        t.setTitle(r.title().trim());
        t.setDescription(r.description());
        if (r.priority() != null) t.setPriority(r.priority());
        t.setAssigneeId(assigneeId);
        t.setAssigneeName(assignee.name());
        t.setDueDate(r.dueDate());
        t.setCreatedBy(uid);
        return tasks.save(t);
    }

    public List<Task> forProject(Long uid, String projectId) {
        projects.get(uid, projectId);
        return tasks.findByProjectId(projectId);
    }

    public List<Task> mine(Long uid) { return tasks.findByAssigneeId(uid); }

    public Task setStatus(Long uid, String id, Status status) {
        Task t = find(id);
        Role role = teams.roleOf(teams.get(t.getTeamId()), uid);
        if (role == Role.JUNIOR && !uid.equals(t.getAssigneeId()))
            throw new ApiException(403, "Juniors can only update tasks assigned to them");
        t.setStatus(status);
        return tasks.save(t);
    }

    public void delete(Long uid, String id) {
        Task t = find(id);
        Role role = teams.roleOf(teams.get(t.getTeamId()), uid);
        if (role != Role.LEADER && !uid.equals(t.getCreatedBy()))
            throw new ApiException(403, "Only a leader or the task's creator can delete it");
        deleteTree(id);
    }

    private void deleteTree(String id) {
        tasks.findByParentTaskId(id).forEach(c -> deleteTree(c.getId()));
        tasks.deleteById(id);
    }

    private Task find(String id) {
        return tasks.findById(id).orElseThrow(() -> new ApiException(404, "Task not found"));
    }
}
