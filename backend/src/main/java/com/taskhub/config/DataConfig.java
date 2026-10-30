package com.taskhub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/** Keeps the two databases apart: JPA repositories use MySQL, Mongo repositories use MongoDB. */
@Configuration
@EnableJpaRepositories(basePackages = "com.taskhub.repo.sql")
@EnableMongoRepositories(basePackages = "com.taskhub.repo.mongo")
public class DataConfig {}
