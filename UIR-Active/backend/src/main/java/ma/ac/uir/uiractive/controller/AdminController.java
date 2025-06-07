package ma.ac.uir.uiractive.controller;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.entity.Admin;
import ma.ac.uir.uiractive.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(
        originPatterns = {"http://localhost:*"},
        allowCredentials = "true",
        allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

//    @PostMapping("/login")
//    public ResponseEntity<?> loginAdmin(
//            @RequestBody LoginRequest loginRequest,  // Changed to @RequestBody
//            HttpSession session) {
//
//        if (adminService.authenticateAdmin(loginRequest.getEmail(), loginRequest.getPassword(), session)) {
//            return ResponseEntity.ok().body(Map.of(
//                    "message", "Admin authenticated successfully",
//                    "admin", adminService.getCurrentAdmin(session)
//            ));
//        }
//        return ResponseEntity.status(401).body(Map.of(
//                "message", "Invalid credentials"
//        ));
//    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAdminStatus(HttpSession session) {
        Admin admin = adminService.getCurrentAdmin(session);

        Map<String, Object> response = new HashMap<>();

        if (admin != null) {
            response.put("authenticated", true);
            response.put("email", admin.getEmail());
            response.put("id", Long.valueOf(admin.getIdU()));
            // Add any other admin properties you want to expose
            return ResponseEntity.ok(response);
        } else {
            response.put("authenticated", false);
            response.put("message", "No admin session found");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest,
                               HttpSession session) {

    // Use the existing authenticateAdmin method that handles sessions
    if (adminService.authenticateAdmin(loginRequest.getEmail(), loginRequest.getPassword(), session)) {
        Admin admin = adminService.getCurrentAdmin(session);
        return ResponseEntity.ok(admin);
    }

    return ResponseEntity.status(401).body("Invalid credentials");
}

    @PostMapping("/logout")
    public ResponseEntity<String> logoutAdmin(HttpSession session) {
        try {
            // Invalidate the session
            session.invalidate();
            return ResponseEntity.ok("Admin logged out successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Logout failed");
        }
    }

    @GetMapping("/current")
    public ResponseEntity<Admin> getCurrentAdmin(HttpSession session) {
        Admin admin = adminService.getCurrentAdmin(session);
        if (admin != null) {
            return ResponseEntity.ok(admin);
        }
        return ResponseEntity.status(401).build();
    }

    public static class LoginRequest {
        private String email;
        private String password;
        // getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}