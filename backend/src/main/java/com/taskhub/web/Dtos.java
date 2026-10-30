package com.taskhub.web;

import com.taskhub.model.*;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public final class Dtos {
    private Dtos() {}

    public record RegisterReq(@NotBlank String name, @NotBlank @Email String email, @NotBlank @Size(min = 6) String password) {}
    public record LoginReq(@NotBlank String email, @NotBlank String password) {}
    public record UserRes(Long id, String name, String email) {}
    public record AuthRes(String token, UserRes user) {}

    public record TeamReq(@NotBlank String name, String description) {}
    public record MemberReq(@NotBlank @Email String email, @NotNull Role role) {}

    public record ProjectReq(@NotBlank String teamId, @NotBlank String name, String description) {}
    public record ProjectRes(String id, String teamId, String teamName, String name, String description,
                             Role myRole, long total, long done) {}

    public record TaskReq(@NotBlank String projectId, String parentTaskId, @NotBlank String title, String description,
                          Priority priority, Long assigneeId, LocalDate dueDate) {}
    public record StatusReq(@NotNull Status status) {}

    public record AiTaskReq(@NotBlank String title, String description) {}
}
