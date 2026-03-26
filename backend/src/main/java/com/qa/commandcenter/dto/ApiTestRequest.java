package com.qa.commandcenter.dto;

import lombok.Data;
import java.util.Map;

@Data
public class ApiTestRequest {
  private String endpoint;
  private String method;
  private String authType; // NONE, BEARER, BASIC, API_KEY
  private String authToken;
  private String apiKey;
  private String apiKeyHeader;
  private String basicUsername;
  private String basicPassword;
  private Map<String, String> headers;
  private String payload;
  private int expectedStatusCode = 200;
  private String description;
}