package ma.ac.uir.uiractive.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import ma.ac.uir.uiractive.dto.UserUpdateDTO;
import ma.ac.uir.uiractive.entity.User;
import ma.ac.uir.uiractive.security.JwtUtil;
import ma.ac.uir.uiractive.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Key;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
//@CrossOrigin(origins = "*")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserServiceImpl userServiceImpl;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder; // Ajout pour encoder les mots de passe
    public UserController(UserServiceImpl userServiceImpl) {
        this.userServiceImpl = userServiceImpl;
    }

    @GetMapping("/count")
    public long countUsers() {
        return userServiceImpl.countUsers();
    }

    @GetMapping("/profile/{email}")
    public ResponseEntity<?> getUserByEmail(@PathVariable String email, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (!isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token invalide ou expiré"));
            }

            Optional<User> user = userServiceImpl.findByEmail(email);
            if (user.isPresent()) {
                UserResponseDTO userResponse = new UserResponseDTO();
                userResponse.setId(user.get().getIdU());
                userResponse.setFirstname(user.get().getFirstname());
                userResponse.setLastname(user.get().getLastname());
                userResponse.setEmail(user.get().getEmail());

                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Utilisateur non trouvé"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    // Récupérer un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable int id, HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (!isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token invalide ou expiré"));
            }

            Optional<User> user = userServiceImpl.findById(Math.toIntExact(id));
            if (user.isPresent()) {
                UserResponseDTO userResponse = new UserResponseDTO();
                userResponse.setId(user.get().getIdU());
                userResponse.setFirstname(user.get().getFirstname());
                userResponse.setLastname(user.get().getLastname());
                userResponse.setEmail(user.get().getEmail());

                return ResponseEntity.ok(userResponse);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Utilisateur non trouvé"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur serveur: " + e.getMessage()));
        }
    }

    // Mettre à jour un utilisateur par email
    @PutMapping("/profile/{email}")
    public ResponseEntity<?> updateUserByEmail(@PathVariable String email,
                                               @RequestBody UserUpdateDTO userUpdateDTO,
                                               HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (!isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token invalide ou expiré"));
            }

            Optional<User> existingUser = userServiceImpl.findByEmail(email);
            if (!existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Utilisateur non trouvé"));
            }

            User user = existingUser.get();

            // Mise à jour des champs
            if (userUpdateDTO.getFirstname() != null && !userUpdateDTO.getFirstname().trim().isEmpty()) {
                user.setFirstname(userUpdateDTO.getFirstname().trim());
            }

            if (userUpdateDTO.getLastname() != null && !userUpdateDTO.getLastname().trim().isEmpty()) {
                user.setLastname(userUpdateDTO.getLastname().trim());
            }

            if (userUpdateDTO.getEmail() != null && !userUpdateDTO.getEmail().trim().isEmpty()) {
                // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
                Optional<User> existingEmailUser = userServiceImpl.findByEmail(userUpdateDTO.getEmail());
                if (existingEmailUser.isPresent() && !existingEmailUser.get().getEmail().equals(email)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("Cet email est déjà utilisé"));
                }
                user.setEmail(userUpdateDTO.getEmail().trim());
            }

            // Mise à jour du mot de passe si fourni
            if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().trim().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(userUpdateDTO.getPassword());
                user.setPassword(encodedPassword);
            }

            User updatedUser = userServiceImpl.save(user);

            UserResponseDTO response = new UserResponseDTO();
            response.setId(updatedUser.getIdU());
            response.setFirstname(updatedUser.getFirstname());
            response.setLastname(updatedUser.getLastname());
            response.setEmail(updatedUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la mise à jour: " + e.getMessage()));
        }
    }

    // Mettre à jour un utilisateur par ID
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id,
                                        @RequestBody UserUpdateDTO userUpdateDTO,
                                        HttpServletRequest request) {
        try {
            String token = extractTokenFromRequest(request);
            if (!isValidToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ErrorResponse("Token invalide ou expiré"));
            }

            Optional<User> existingUser = userServiceImpl.findById(Math.toIntExact(id));
            if (!existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Utilisateur non trouvé"));
            }

            User user = existingUser.get();

            // Mise à jour des champs
            if (userUpdateDTO.getFirstname() != null && !userUpdateDTO.getFirstname().trim().isEmpty()) {
                user.setFirstname(userUpdateDTO.getFirstname().trim());
            }

            if (userUpdateDTO.getLastname() != null && !userUpdateDTO.getLastname().trim().isEmpty()) {
                user.setLastname(userUpdateDTO.getLastname().trim());
            }

            if (userUpdateDTO.getEmail() != null && !userUpdateDTO.getEmail().trim().isEmpty()) {
                // Vérifier si l'email n'est pas déjà utilisé par un autre utilisateur
                Optional<User> existingEmailUser = userServiceImpl.findByEmail(userUpdateDTO.getEmail());
                if (existingEmailUser.isPresent() && existingEmailUser.get().getIdU() != id) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(new ErrorResponse("Cet email est déjà utilisé"));
                }
                user.setEmail(userUpdateDTO.getEmail().trim());
            }

            // Mise à jour du mot de passe si fourni
            if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().trim().isEmpty()) {
                String encodedPassword = passwordEncoder.encode(userUpdateDTO.getPassword());
                user.setPassword(encodedPassword);
            }

            User updatedUser = userServiceImpl.save(user);

            UserResponseDTO response = new UserResponseDTO();
            response.setId(updatedUser.getIdU());
            response.setFirstname(updatedUser.getFirstname());
            response.setLastname(updatedUser.getLastname());
            response.setEmail(updatedUser.getEmail());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Erreur lors de la mise à jour: " + e.getMessage()));
        }
    }

    private final String SECRET_KEY = "7e1SIohpeAAGnJmA0lwh076M4ZkN9Wsj+k0y3cU/KgY=";

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    private boolean isValidToken(String token) {
        try {
            if (token == null) return false;

            Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

            Claims claims = Jwts
                    .parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return claims.getExpiration().after(new java.util.Date());
        } catch (Exception e) {
            return false;
        }
    }
}

// DTOs
class UserResponseDTO {
    private int idU;
    private String firstname;
    private String lastname;
    private String email;

    // Getters and Setters
    public int getIdU() { return idU; }
    public void setId(int idU) { this.idU = idU; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}

class ErrorResponse {
    private String message;

    public ErrorResponse(String message) {
        this.message = message;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}