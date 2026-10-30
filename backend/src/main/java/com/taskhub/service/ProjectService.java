package com.taskhub.service;

import com.taskhub.model.Project;
import com.taskhub.model.Role;
import com.taskhub.model.Status;
import com.taskhub.model.Team;
import com.taskhub.repo.mongo.ProjectRepo;
import com.taskhub.repo.mongo.TaskRepo;
import com.taskhub.web.ApiException;
import com.taskhub.web.Dtos.ProjectReq;
import com.taskhub.web.Dtos.ProjectRes;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepo projects;
    private final TaskRepo tasks;
    private final TeamService teams;

    public Project create(Long uid, ProjectReq r) {
        Team t = teams.get(r.teamId());
        if (teams.roleOf(t, uid) != Role.LEADER) throw new ApiException(403, "Only a team leader can create projects");
        Project p = new Project();
        p.setTeamId(t.getId());
        p.setName(r.name().trim());
        p.setDescription(r.description());
        p.setCreatedBy(uid);
        return projects.save(p);
    }

    public List<ProjectRes> mine(Long uid) {
        Map<String, Team> byId = teams.mine(uid).stream().collect(Collectors.toMap(Team::getId, Function.identity()));
        return projects.findByTeamIdIn(byId.keySet()).stream().map(p -> {
            Team t = byId.get(p.getTeamId());
            return new ProjectRes(p.getId(), t.getId(), t.getName(), p.getName(), p.getDescription(),
                    teams.roleOf(t, uid), tasks.countByProjectId(p.getId()),
                    tasks.countByProjectIdAndStatus(p.getId(), Status.DONE));
        }).toList();
    }

    public Project get(Long uid, String id) {
        Project p = projects.findById(id).orElseThrow(() -> new ApiException(404, "Project not found"));
        teams.roleOf(teams.get(p.getTeamId()), uid);   // membership check
        return p;
    }
}
