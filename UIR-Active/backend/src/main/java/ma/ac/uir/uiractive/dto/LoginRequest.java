package ma.ac.uir.uiractive.dto;


import lombok.Getter;

@Getter
public class LoginRequest {

    private String email;
    private String password;

    // Constructors, Getters, Setters
    public LoginRequest() {}

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
