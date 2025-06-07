package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.UserRepository;
import ma.ac.uir.uiractive.dto.UserUpdateDTO;
import ma.ac.uir.uiractive.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Service
public class UserServiceImpl {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getUserById(int id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public User updateUser(int id, UserUpdateDTO userUpdateDTO) {
        User existingUser = getUserById(id);

        if (userUpdateDTO.getFirstname() != null) {
            existingUser.setFirstname(userUpdateDTO.getFirstname());
        }
        if (userUpdateDTO.getLastname() != null) {
            existingUser.setLastname(userUpdateDTO.getLastname());
        }
        if (userUpdateDTO.getEmail() != null) {
            existingUser.setEmail(userUpdateDTO.getEmail());
        }
        if (userUpdateDTO.getPassword() != null && !userUpdateDTO.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userUpdateDTO.getPassword()));
        }

        return userRepository.save(existingUser);
    }


    // Récupérer un utilisateur par ID
    public Optional<User> findById(int id) {
        return userRepository.findById(id);
    }

    // Récupérer un utilisateur par email
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Sauvegarder un utilisateur (création ou mise à jour)
    public User save(User user) {
        return userRepository.save(user);
    }

    // Supprimer un utilisateur par ID
    public void deleteById(int id) {
        userRepository.deleteById(id);
    }

    // Vérifier si un utilisateur existe par email
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    // Vérifier si un utilisateur existe par ID
    public boolean existsById(int id) {
        return userRepository.existsById(id);
    }

    // Compter le nombre total d'utilisateurs
    public long count() {
        return userRepository.count();
    }

    public long countUsers() {
        return userRepository.count();
    }
}
