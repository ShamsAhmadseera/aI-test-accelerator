package com.qa.commandcenter.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Document(collection = "test_runs")
public class TestRun {
  @Id
  private String id;

  private String endpoint;
  private String method;
  private String authType;
  private Map<String, String> headers;
  private String payload;

  private String generatedRestAssured;
  private String generatedGatling;
  private String generatedPostman;

  private TestResult result;
  private String status; // PENDING, RUNNING, COMPLETED, FAILED
  private String createdBy;
  private LocalDateTime createdAt = LocalDateTime.now();
  private LocalDateTime completedAt;

  @Data
  public static class TestResult {
    private int statusCode;
    private long responseTimeMs;
    private double throughput;
    private double errorRate;
    private String responseBody;
    private boolean passed;
    private String failureReason;
  }
}