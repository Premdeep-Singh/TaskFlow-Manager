package com.taskhub.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDate;

/** A task, or a subtask when parentTaskId is set. Subtasks can nest to any depth. */
@Getter @Setter @NoArgsConstructor
@Document("tasks")
public class Task {
    @Id private String id;
    @Indexed private String projectId;
    private String teamId;
    private String parentTaskId;
    private String title;
    private String description;
    private Status status = Status.TODO;
    private Priority priority = Priority.MEDIUM;
    @Indexed private Long assigneeId;
    private String assigneeName;
    private LocalDate dueDate;
    private Long createdBy;
    private Instant createdAt = Instant.now();
}
