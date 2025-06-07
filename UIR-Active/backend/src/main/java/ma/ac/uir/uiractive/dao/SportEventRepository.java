package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.SportEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SportEventRepository extends JpaRepository<SportEvent, Long> {
    @Query("SELECT e FROM SportEvent e WHERE TYPE(e.creator) = Student")
    List<SportEvent> findAllStudentEvents();

    @Query("SELECT e FROM SportEvent e WHERE TYPE(e.creator) = Admin")
    List<SportEvent> findAllAdminEvents();

    @Query("SELECT COUNT(e) FROM SportEvent e WHERE TYPE(e.creator) = Student")
    long countStudentEvents();

    @Query("SELECT COUNT(e) FROM SportEvent e WHERE TYPE(e.creator) = Admin")
    long countAdminEvents();
}