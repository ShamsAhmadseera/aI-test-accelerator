package com.qa.commandcenter.service;

import com.qa.commandcenter.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

  private final @Lazy PasswordEncoder passwordEncoder;

  // In-memory storage for testing
  private final Map<String, User> users = new ConcurrentHashMap<>();

  @PostConstruct
  public void initializeTestUsers() {
    // Create some default test users so you don't have to register every time
    createTestUser("admin", "admin", "admin@test.com");
    createTestUser("testuser", "testpass", "test@test.com");
    createTestUser("demo", "demo", "demo@test.com");
    System.out.println("✅ Initialized test users: admin/admin, testuser/testpass, demo/demo");
  }

  private void createTestUser(String username, String password, String email) {
    try {
      User user = new User();
      user.setId(java.util.UUID.randomUUID().toString());
      user.setUsername(username);
      user.setPassword(passwordEncoder.encode(password));
      user.setEmail(email);
      user.setRole("QA_ENGINEER");
      users.put(username, user);
    } catch (Exception e) {
      System.err.println("Failed to create test user: " + username);
    }
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    User user = users.get(username);
    if (user == null) {
      throw new UsernameNotFoundException("User not found: " + username);
    }
    return new org.springframework.security.core.userdetails.User(
        user.getUsername(),
        user.getPassword(),
        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
    );
  }

  public User register(String username, String password, String email) {
    if (users.containsKey(username)) {
      throw new RuntimeException("Username already exists");
    }
    User user = new User();
    user.setId(java.util.UUID.randomUUID().toString());
    user.setUsername(username);
    user.setPassword(passwordEncoder.encode(password));
    user.setEmail(email);
    user.setRole("QA_ENGINEER");
    users.put(username, user);
    return user;
  }
}
