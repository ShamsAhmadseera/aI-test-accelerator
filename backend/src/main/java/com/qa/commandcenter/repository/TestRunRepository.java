package com.qa.commandcenter.repository;

import com.qa.commandcenter.model.TestRun;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TestRunRepository extends MongoRepository<TestRun, String> {
  List<TestRun> findByCreatedByOrderByCreatedAtDesc(String createdBy);
  List<TestRun> findTop10ByOrderByCreatedAtDesc();
  long countByStatus(String status);
  long countByResultPassed(boolean passed);
}