package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.AuthRepository;
import ma.ac.uir.uiractive.dao.StudentRepository;
import ma.ac.uir.uiractive.dao.UserRepository;
import ma.ac.uir.uiractive.dto.LoginRequest;
import ma.ac.uir.uiractive.entity.Student;
import ma.ac.uir.uiractive.entity.User;
import ma.ac.uir.uiractive.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ma.ac.uir.uiractive.dto.RegisterRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentService studentService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Autowired
    public AuthServiceImpl(UserRepository userRepository, StudentService studentService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, UserDetailsServiceImpl userDetailsService) {
        this.userRepository = userRepository;
        this.studentService = studentService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public ResponseEntity<String> register(RegisterRequest request) {
        Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        System.out.println("Register endpoint hit with: " + request.getEmail());

        if (existingUser.isPresent()) {
            return ResponseEntity.badRequest().body("Email déjà utilisé !");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(hashedPassword);
        user.setFirstname(request.getFirstname());
        user.setLastname(request.getLastname());

        userRepository.save(user);
        return ResponseEntity.ok("User registered: " + request.getEmail());
    }

    @Override
    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email introuvable"));

        if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            return jwtUtil.generateTokenWithUserId(userDetails, (long) user.getIdU());
        } else {
            throw new RuntimeException("Mot de passe incorrect");
        }
    }

    // Add this new method that returns complete user info
    public Map<String, Object> loginWithUserInfo(LoginRequest request) {
        try {
            // Find the user
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Email introuvable"));

            // Verify password
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                throw new RuntimeException("Mot de passe incorrect");
            }

            // Generate token
            UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
            String token = jwtUtil.generateTokenWithUserId(userDetails, (long) user.getIdU());

            // Create response with all needed information
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("userId", user.getIdU()); // Assuming getIdU() returns the user ID
            response.put("email", user.getEmail());
            response.put("firstname", user.getFirstname());
            response.put("lastname", user.getLastname());

            // Also create a user object for cleaner frontend handling
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("id", user.getIdU());
            userInfo.put("email", user.getEmail());
            userInfo.put("firstname", user.getFirstname());
            userInfo.put("lastname", user.getLastname());

            response.put("user", userInfo);

            return response;

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la connexion: " + e.getMessage());
        }
    }
}