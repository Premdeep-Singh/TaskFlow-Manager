package com.taskhub.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

/** Stored in MongoDB. Roles are per team: someone can lead one team and be a junior in another. */
@Getter @Setter @NoArgsConstructor
@Document("teams")
public class Team {
    @Id private String id;
    private String name;
    private String description;
    private Long ownerId;
    private List<Member> members = new ArrayList<>();

    public record Member(Long userId, String name, String email, Role role) {}
}
