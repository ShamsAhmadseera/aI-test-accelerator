package com.qa.commandcenter.service;

import com.qa.commandcenter.dto.ApiTestRequest;
import com.qa.commandcenter.model.TestRun;
import com.qa.commandcenter.repository.TestRunRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestRunService {

  private final TestRunRepository testRunRepository;
  private final AiGeneratorService aiGeneratorService;
  private final RestTemplate restTemplate;

  public TestRun createAndRun(ApiTestRequest request, String username) {
    TestRun testRun = new TestRun();
    testRun.setEndpoint(request.getEndpoint());
    testRun.setMethod(request.getMethod());
    testRun.setAuthType(request.getAuthType());
    testRun.setHeaders(request.getHeaders());
    testRun.setPayload(request.getPayload());
    testRun.setStatus("RUNNING");
    testRun.setCreatedBy(username);
    testRun = testRunRepository.save(testRun);

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

    return testRunRepository.save(testRun);
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
    return testRunRepository.findTop10ByOrderByCreatedAtDesc();
  }

  public List<TestRun> getRunsByUser(String username) {
    return testRunRepository.findByCreatedByOrderByCreatedAtDesc(username);
  }

  public Map<String, Object> getDashboardStats() {
    long total = testRunRepository.count();
    long passed = testRunRepository.countByResultPassed(true);
    long failed = total - passed;
    long running = testRunRepository.countByStatus("RUNNING");

    return Map.of(
        "total", total,
        "passed", passed,
        "failed", failed,
        "running", running,
        "passRate", total > 0 ? (double) passed / total * 100 : 0
    );
  }

  public TestRun getById(String id) {
    return testRunRepository.findById(id).orElseThrow(() -> new RuntimeException("TestRun not found"));
  }
}