package com.qa.commandcenter.model;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SimpleUser {
  private String id;
  private String username;
  private String password;
  private String email;
  private String role = "QA_ENGINEER";
  private LocalDateTime createdAt = LocalDateTime.now();
}
