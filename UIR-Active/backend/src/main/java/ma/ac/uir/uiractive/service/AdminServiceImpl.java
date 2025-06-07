package ma.ac.uir.uiractive.service;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.dao.AdminRepository;
import ma.ac.uir.uiractive.entity.Admin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final AdminRepository adminRepository;
    private static final String ADMIN_SESSION_KEY = "ADMIN_ID";
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AdminServiceImpl(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(); // Instanciation ici
    }

    @Override
    public boolean authenticateAdmin(String email, String password, HttpSession session) {
        return adminRepository.findByEmail(email)
                .filter(admin -> passwordEncoder.matches(password, admin.getPassword())) // compare le hash
                .map(admin -> {
                    session.setAttribute(ADMIN_SESSION_KEY, admin.getIdU());
                    return true;
                })
                .orElse(false);
    }


    @Override
    public void logoutAdmin(HttpSession session) {
        session.removeAttribute(ADMIN_SESSION_KEY);
        session.invalidate();
    }

    @Override
    public Admin getCurrentAdmin(HttpSession session) {
        Integer adminId = (Integer) session.getAttribute(ADMIN_SESSION_KEY);
        if (adminId == null) return null;
        return adminRepository.findById(adminId).orElse(null);
    }

    @Override
    public boolean isAdminLoggedIn(HttpSession session) {
        return session.getAttribute(ADMIN_SESSION_KEY) != null;
    }


    // Add these methods to your AdminService class

    /**
     * Get the current admin from the session
     */
//    public Admin getCurrentAdmin(HttpSession session) {
//        Object adminObj = session.getAttribute("admin");
//        if (adminObj instanceof Admin) {
//            return (Admin) adminObj;
//        }
//        return null;
//    }



    /**
     * Check if the provided password matches the admin's password
     * This is a placeholder - implement your actual password checking logic
     */
    private boolean checkPassword(Admin admin, String password) {
        // If you're using BCrypt or another password encoder:
         return passwordEncoder.matches(password, admin.getPassword());

        // For now, this is a simple comparison (NOT SECURE for production)
        //return admin.getPassword().equals(password);
    }

    /**
     * Create a new admin session
     */
    public void createAdminSession(HttpSession session, Admin admin) {
        session.setAttribute("admin", admin);
        session.setMaxInactiveInterval(3600); // 1 hour session timeout
    }
}