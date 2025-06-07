package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dto.LoginRequest;
import ma.ac.uir.uiractive.dto.RegisterRequest;
import org.springframework.http.ResponseEntity;

import java.util.Map;

public interface AuthService {
ResponseEntity<String> register(RegisterRequest request);
String login(LoginRequest request);

    Map<String, Object> loginWithUserInfo(LoginRequest request);

}
