package com.qa.commandcenter.service;

import com.qa.commandcenter.dto.ApiTestRequest;
import com.qa.commandcenter.model.TestRun;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestRunService {

  private final AiGeneratorService aiGeneratorService;
  private final RestTemplate restTemplate;

  // In-memory storage for testing
  private final Map<String, TestRun> testRuns = new ConcurrentHashMap<>();
  private final List<TestRun> recentRuns = Collections.synchronizedList(new ArrayList<>());

  public TestRun createAndRun(ApiTestRequest request, String username) {
    TestRun testRun = new TestRun();
    testRun.setId(UUID.randomUUID().toString());
    testRun.setEndpoint(request.getEndpoint());
    testRun.setMethod(request.getMethod());
    testRun.setAuthType(request.getAuthType());
    testRun.setHeaders(request.getHeaders());
    testRun.setPayload(request.getPayload());
    testRun.setStatus("RUNNING");
    testRun.setCreatedBy(username);

    try {
      // Execute actual API call
      TestRun.TestResult result = executeApiCall(request);
      testRun.setResult(result);

      // Generate AI test artifacts
      testRun.setGeneratedRestAssured(aiGeneratorService.generateRestAssured(request));
      testRun.setGeneratedGatling(aiGeneratorService.generateGatling(request));
      testRun.setGeneratedPostman(aiGeneratorService.generatePostmanCollection(request));

      testRun.setStatus("COMPLETED");
      testRun.setCompletedAt(LocalDateTime.now());
    } catch (Exception e) {
      log.error("Error running test", e);
      testRun.setStatus("FAILED");
    }

    // Store in memory
    testRuns.put(testRun.getId(), testRun);
    recentRuns.add(0, testRun);
    if (recentRuns.size() > 10) {
      recentRuns.remove(recentRuns.size() - 1);
    }

    return testRun;
  }

  private TestRun.TestResult executeApiCall(ApiTestRequest request) {
    TestRun.TestResult result = new TestRun.TestResult();
    long startTime = System.currentTimeMillis();

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);

      // Apply auth
      if ("BEARER".equals(request.getAuthType()) && request.getAuthToken() != null) {
        headers.setBearerAuth(request.getAuthToken());
      } else if ("API_KEY".equals(request.getAuthType()) && request.getApiKey() != null) {
        headers.set(request.getApiKeyHeader() != null ? request.getApiKeyHeader() : "X-API-Key", request.getApiKey());
      } else if ("BASIC".equals(request.getAuthType())) {
        headers.setBasicAuth(request.getBasicUsername(), request.getBasicPassword());
      }

      // Add custom headers
      if (request.getHeaders() != null) {
        request.getHeaders().forEach(headers::set);
      }

      HttpEntity<String> entity = new HttpEntity<>(request.getPayload(), headers);
      HttpMethod method = HttpMethod.valueOf(request.getMethod().toUpperCase());

      ResponseEntity<String> response = restTemplate.exchange(
          request.getEndpoint(), method, entity, String.class
      );

      long responseTime = System.currentTimeMillis() - startTime;
      result.setStatusCode(response.getStatusCode().value());
      result.setResponseTimeMs(responseTime);
      result.setResponseBody(response.getBody());
      result.setThroughput(1000.0 / responseTime);
      result.setErrorRate(0.0);
      result.setPassed(response.getStatusCode().value() == request.getExpectedStatusCode());

    } catch (Exception e) {
      long responseTime = System.currentTimeMillis() - startTime;
      result.setStatusCode(500);
      result.setResponseTimeMs(responseTime);
      result.setPassed(false);
      result.setErrorRate(100.0);
      result.setFailureReason(e.getMessage());
    }

    return result;
  }

  public List<TestRun> getRecentRuns() {
    return new ArrayList<>(recentRuns);
  }

  public List<TestRun> getRunsByUser(String username) {
    return testRuns.values().stream()
        .filter(run -> username.equals(run.getCreatedBy()))
        .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
        .toList();
  }

  public Map<String, Object> getDashboardStats() {
    long total = testRuns.size();
    long passed = testRuns.values().stream()
        .mapToLong(run -> run.getResult() != null && run.getResult().isPassed() ? 1 : 0)
        .sum();
    long failed = total - passed;
    long running = testRuns.values().stream()
        .mapToLong(run -> "RUNNING".equals(run.getStatus()) ? 1 : 0)
        .sum();

    return Map.of(
        "total", total,
        "passed", passed,
        "failed", failed,
        "running", running,
        "passRate", total > 0 ? (double) passed / total * 100 : 0
    );
  }

  public TestRun getById(String id) {
    TestRun testRun = testRuns.get(id);
    if (testRun == null) {
      throw new RuntimeException("TestRun not found");
    }
    return testRun;
  }
}
