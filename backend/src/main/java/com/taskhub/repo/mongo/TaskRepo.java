package com.taskhub.repo.mongo;

import com.taskhub.model.Status;
import com.taskhub.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TaskRepo extends MongoRepository<Task, String> {
    List<Task> findByProjectId(String projectId);
    List<Task> findByAssigneeId(Long assigneeId);
    List<Task> findByParentTaskId(String parentTaskId);
    long countByProjectId(String projectId);
    long countByProjectIdAndStatus(String projectId, Status status);
}
