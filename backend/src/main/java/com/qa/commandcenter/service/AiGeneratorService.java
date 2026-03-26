package com.qa.commandcenter.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.qa.commandcenter.dto.ApiTestRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiGeneratorService {

  @Value("${anthropic.api.key}")
  private String apiKey;

  @Value("${anthropic.model}")
  private String model;

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  private String callClaude(String prompt) {
    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("x-api-key", apiKey);
      headers.set("anthropic-version", "2023-06-01");

      Map<String, Object> body = Map.of(
          "model", model,
          "max_tokens", 4096,
          "messages", List.of(Map.of("role", "user", "content", prompt))
      );

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
      ResponseEntity<String> response = restTemplate.exchange(
          "https://api.anthropic.com/v1/messages",
          HttpMethod.POST,
          entity,
          String.class
      );

      JsonNode root = objectMapper.readTree(response.getBody());
      return root.path("content").get(0).path("text").asText();
    } catch (Exception e) {
      log.error("Error calling Claude API", e);
      return "// Error generating code: " + e.getMessage();
    }
  }

  public String generateRestAssured(ApiTestRequest request) {
    String prompt = String.format("""
            You are a senior QA automation engineer. Generate a complete RestAssured Java test class using JUnit 5 for the following API:
            
            Endpoint: %s
            Method: %s
            Auth Type: %s
            Auth Token: %s
            Headers: %s
            Payload: %s
            Expected Status Code: %d
            Description: %s
            
            Requirements:
            - Use RestAssured with BDD style (given/when/then)
            - Include proper imports
            - Add multiple test scenarios: happy path, negative tests, boundary tests, security tests
            - Add assertions for status code, response time, response body
            - Use Allure annotations for reporting
            - Follow best practices with base URI configuration
            - Include authentication setup
            - Add meaningful test names and JavaDoc
            
            Return ONLY the Java code, no explanation.
            """,
        request.getEndpoint(), request.getMethod(), request.getAuthType(),
        request.getAuthToken(), request.getHeaders(), request.getPayload(),
        request.getExpectedStatusCode(), request.getDescription()
    );
    return callClaude(prompt);
  }

  public String generateGatling(ApiTestRequest request) {
    String prompt = String.format("""
            You are a senior performance engineer expert in Gatling. Generate a complete Gatling Scala simulation for:
            
            Endpoint: %s
            Method: %s
            Auth Type: %s
            Auth Token: %s
            Headers: %s
            Payload: %s
            Description: %s
            
            Requirements:
            - Use Gatling DSL with Scala
            - Include multiple load scenarios: smoke test, load test, stress test, spike test
            - Configure ramp-up periods and steady state
            - Add assertions for response time percentiles (p95, p99)
            - Add throughput assertions
            - Include feeder for dynamic data
            - Add proper checks on response status and body
            - Configure proper think time
            - Add session management
            - Include comments explaining each scenario
            
            Return ONLY the Scala code, no explanation.
            """,
        request.getEndpoint(), request.getMethod(), request.getAuthType(),
        request.getAuthToken(), request.getHeaders(), request.getPayload(),
        request.getDescription()
    );
    return callClaude(prompt);
  }

  public String generatePostmanCollection(ApiTestRequest request) {
    String prompt = String.format("""
            You are a senior QA engineer. Generate a complete Postman Collection v2.1 JSON for:
            
            Endpoint: %s
            Method: %s
            Auth Type: %s
            Auth Token: %s
            Headers: %s
            Payload: %s
            Expected Status Code: %d
            Description: %s
            
            Requirements:
            - Create a proper Postman Collection v2.1 JSON structure
            - Include multiple requests: happy path, error cases, edge cases
            - Add pre-request scripts for dynamic data
            - Add test scripts with assertions for status, response time, body validation
            - Include environment variables
            - Add proper auth configuration
            - Include collection variables
            - Add security test cases (SQL injection, XSS, auth bypass attempts)
            
            Return ONLY valid JSON for the Postman collection, no explanation.
            """,
        request.getEndpoint(), request.getMethod(), request.getAuthType(),
        request.getAuthToken(), request.getHeaders(), request.getPayload(),
        request.getExpectedStatusCode(), request.getDescription()
    );
    return callClaude(prompt);
  }
}