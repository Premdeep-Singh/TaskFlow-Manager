package com.taskhub.repo.mongo;

import com.taskhub.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

public interface ProjectRepo extends MongoRepository<Project, String> {
    List<Project> findByTeamIdIn(Collection<String> teamIds);
}
