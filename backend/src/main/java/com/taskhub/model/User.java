package com.taskhub.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

/** Stored in MySQL: identity and credentials only. */
@Getter @Setter @NoArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, unique = true, length = 190)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    private Instant createdAt = Instant.now();
}
