package com.taskhub.model;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Getter @Setter @NoArgsConstructor
@Document("projects")
public class Project {
    @Id private String id;
    @Indexed private String teamId;
    private String name;
    private String description;
    private Long createdBy;
    private Instant createdAt = Instant.now();
}
