package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByStatus(String status);
    long countByStatus(String status);
    List<Reservation> findByUserIdU(long id);
    List<Reservation> findByUserEmail(String user_email);

}