package com.taskhub.web;

import com.taskhub.model.Task;
import com.taskhub.service.TaskService;
import com.taskhub.web.Dtos.StatusReq;
import com.taskhub.web.Dtos.TaskReq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    private final TaskService tasks;

    @GetMapping("/mine")
    public List<Task> mine(@AuthenticationPrincipal Long uid) { return tasks.mine(uid); }

    @PostMapping
    public Task create(@AuthenticationPrincipal Long uid, @Valid @RequestBody TaskReq r) { return tasks.create(uid, r); }

    @PatchMapping("/{id}/status")
    public Task status(@AuthenticationPrincipal Long uid, @PathVariable String id, @Valid @RequestBody StatusReq r) {
        return tasks.setStatus(uid, id, r.status());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal Long uid, @PathVariable String id) {
        tasks.delete(uid, id);
        return ResponseEntity.noContent().build();
    }
}
