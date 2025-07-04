package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthRepository extends JpaRepository<User, Integer> {
}
