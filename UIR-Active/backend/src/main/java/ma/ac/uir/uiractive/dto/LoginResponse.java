package ma.ac.uir.uiractive.dto;

import ma.ac.uir.uiractive.entity.Student;

public class LoginResponse {
    private String token;
    private Long userId;
    private String email;
    private Student user;

    // Constructors
    public LoginResponse() {}

    // Getters and Setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Student getUser() {
        return user;
    }

    public void setUser(Student user) {
        this.user = user;
    }
}