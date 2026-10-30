package com.taskhub.web;

import com.taskhub.model.Project;
import com.taskhub.model.Task;
import com.taskhub.service.ProjectService;
import com.taskhub.service.TaskService;
import com.taskhub.web.Dtos.ProjectReq;
import com.taskhub.web.Dtos.ProjectRes;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {
    private final ProjectService projects;
    private final TaskService tasks;

    @GetMapping("/mine")
    public List<ProjectRes> mine(@AuthenticationPrincipal Long uid) { return projects.mine(uid); }

    @PostMapping
    public Project create(@AuthenticationPrincipal Long uid, @Valid @RequestBody ProjectReq r) { return projects.create(uid, r); }

    @GetMapping("/{id}/tasks")
    public List<Task> tasks(@AuthenticationPrincipal Long uid, @PathVariable String id) { return tasks.forProject(uid, id); }
}
