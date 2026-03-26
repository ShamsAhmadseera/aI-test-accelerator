package com.qa.commandcenter.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
  @Id
  private String id;

  @Indexed(unique = true)
  private String username;

  private String password;
  private String email;
  private String role = "QA_ENGINEER";
  private LocalDateTime createdAt = LocalDateTime.now();
}