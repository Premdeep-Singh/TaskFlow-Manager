package com.taskhub.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskhub.model.Project;
import com.taskhub.model.Task;
import com.taskhub.service.GeminiService;
import com.taskhub.service.ProjectService;
import com.taskhub.service.TaskService;
import com.taskhub.web.Dtos.AiTaskReq;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final GeminiService gemini;
    private final ProjectService projects;
    private final TaskService tasks;
    private final ObjectMapper mapper;

    /** Suggests subtasks for a task title and description. */
    @PostMapping("/subtasks")
    public List<String> subtasks(@Valid @RequestBody AiTaskReq r) {
        String prompt = "You are a project planning assistant. Break this task into 3 to 6 concrete, actionable "
                + "subtasks, each under 80 characters. Respond with only a JSON array of strings.\n"
                + "Task: " + r.title() + "\nDetails: " + (r.description() == null ? "none" : r.description());
        try {
            List<String> list = mapper.readValue(gemini.generate(prompt, true), new TypeReference<List<String>>() {});
            return list.stream().filter(s -> s != null && !s.isBlank()).limit(6).toList();
        } catch (JsonProcessingException e) {
            throw new ApiException(502, "The AI's answer was unreadable. Try again.");
        }
    }

    /** Writes a short status summary of a project from its tasks. */
    @GetMapping("/projects/{id}/summary")
    public Map<String, String> summary(@AuthenticationPrincipal Long uid, @PathVariable String id) {
        Project p = projects.get(uid, id);
        List<Task> all = tasks.forProject(uid, id);
        if (all.isEmpty()) return Map.of("summary", "This project has no tasks yet.");
        String lines = all.stream().map(t -> "- [" + t.getStatus() + "] " + t.getTitle()
                + " (assignee: " + t.getAssigneeName() + ", due: " + (t.getDueDate() == null ? "none" : t.getDueDate())
                + (t.getParentTaskId() != null ? ", subtask" : "") + ")").collect(Collectors.joining("\n"));
        String prompt = "Summarize the status of the project \"" + p.getName() + "\" in under 90 words of plain text. "
                + "Mention progress, what is at risk or overdue (today is " + java.time.LocalDate.now()
                + "), and the most useful next step.\nTasks:\n" + lines;
        return Map.of("summary", gemini.generate(prompt, false).trim());
    }
}
