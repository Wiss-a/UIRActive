package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.dao.StudentRepository;
import ma.ac.uir.uiractive.dto.LoginRequest;
import ma.ac.uir.uiractive.dto.RegisterRequest;
import ma.ac.uir.uiractive.entity.Student;
import ma.ac.uir.uiractive.entity.User;
import ma.ac.uir.uiractive.service.AuthService;
import ma.ac.uir.uiractive.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
private final StudentService studentService;
    @Autowired
    public AuthController(AuthService authService, StudentService studentService) {
        this.authService = authService;
        this.studentService = studentService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }

@PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
    try {
        Map<String, Object> response = authService.loginWithUserInfo(request);
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}

    @GetMapping("/api/test/protected")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("You are authenticated!");
    }
}