package com.qa.commandcenter.controller;

import com.qa.commandcenter.dto.ApiTestRequest;
import com.qa.commandcenter.model.TestRun;
import com.qa.commandcenter.service.AiGeneratorService;
import com.qa.commandcenter.service.TestRunService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestRunController {

  private final TestRunService testRunService;
  private final AiGeneratorService aiGeneratorService;

  @PostMapping("/run")
  public ResponseEntity<TestRun> runTest(@RequestBody ApiTestRequest request, Authentication auth) {
    TestRun result = testRunService.createAndRun(request, auth.getName());
    return ResponseEntity.ok(result);
  }

  @PostMapping("/generate/restassured")
  public ResponseEntity<Map<String, String>> generateRestAssured(@RequestBody ApiTestRequest request) {
    String code = aiGeneratorService.generateRestAssured(request);
    return ResponseEntity.ok(Map.of("code", code, "language", "java"));
  }

  @PostMapping("/generate/gatling")
  public ResponseEntity<Map<String, String>> generateGatling(@RequestBody ApiTestRequest request) {
    String code = aiGeneratorService.generateGatling(request);
    return ResponseEntity.ok(Map.of("code", code, "language", "scala"));
  }

  @PostMapping("/generate/postman")
  public ResponseEntity<Map<String, String>> generatePostman(@RequestBody ApiTestRequest request) {
    String collection = aiGeneratorService.generatePostmanCollection(request);
    return ResponseEntity.ok(Map.of("code", collection, "language", "json"));
  }

  @GetMapping("/history")
  public ResponseEntity<List<TestRun>> getHistory(Authentication auth) {
    return ResponseEntity.ok(testRunService.getRunsByUser(auth.getName()));
  }

  @GetMapping("/recent")
  public ResponseEntity<List<TestRun>> getRecent() {
    return ResponseEntity.ok(testRunService.getRecentRuns());
  }

  @GetMapping("/stats")
  public ResponseEntity<Map<String, Object>> getStats() {
    return ResponseEntity.ok(testRunService.getDashboardStats());
  }

  @GetMapping("/{id}")
  public ResponseEntity<TestRun> getById(@PathVariable String id) {
    return ResponseEntity.ok(testRunService.getById(id));
  }
}