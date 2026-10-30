package com.taskhub.repo.mongo;

import com.taskhub.model.Team;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TeamRepo extends MongoRepository<Team, String> {
    List<Team> findByMembersUserId(Long userId);
}
