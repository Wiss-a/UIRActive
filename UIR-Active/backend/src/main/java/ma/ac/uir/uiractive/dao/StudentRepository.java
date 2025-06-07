package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    @Query("SELECT s FROM Student s WHERE " +
            "LOWER(s.firstname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.lastname) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> findByFirstNameContainingOrLastNameContainingOrEmailContaining(
            @Param("query") String query);
    Optional<Student> findByEmail(String email);
}
