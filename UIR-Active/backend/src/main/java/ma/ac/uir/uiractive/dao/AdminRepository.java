package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {

    // Trouver un admin par email (pour l'authentification)
    Optional<Admin> findByEmail(String email);
}