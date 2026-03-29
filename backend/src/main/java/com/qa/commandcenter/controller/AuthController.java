package com.qa.commandcenter.controller;

import com.qa.commandcenter.dto.LoginRequest;
import com.qa.commandcenter.security.JwtUtil;
import com.qa.commandcenter.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationManager authenticationManager;
  private final JwtUtil jwtUtil;
  private final UserService userService;

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
      authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
      );
      String token = jwtUtil.generateToken(request.getUsername());
      return ResponseEntity.ok(Map.of(
          "token", token,
          "username", request.getUsername(),
          "message", "Login successful"
      ));
    } catch (Exception e) {
      // Log the exact error
      System.err.println("Login failed for user: " + request.getUsername() + " | Error: " + e.getClass().getSimpleName() + " - " + e.getMessage());
      return ResponseEntity.status(401).body(Map.of("message", "Authentication failed: " + e.getMessage()));
    }
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
    var user = userService.register(
        body.get("username"),
        body.get("password"),
        body.get("email")
    );
    return ResponseEntity.ok(Map.of("message", "User registered successfully", "username", user.getUsername()));
  }
}