package com.qa.commandcenter.dto;

import lombok.Data;
import lombok.AllArgsConstructor;

@Data
public class LoginRequest {
  private String username;
  private String password;
}