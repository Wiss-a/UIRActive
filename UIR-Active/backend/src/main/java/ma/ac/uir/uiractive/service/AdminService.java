package ma.ac.uir.uiractive.service;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.entity.Admin;

public interface AdminService {
    boolean authenticateAdmin(String email, String password, HttpSession session);
    void logoutAdmin(HttpSession session);
    Admin getCurrentAdmin(HttpSession session);
    boolean isAdminLoggedIn(HttpSession session);
}
