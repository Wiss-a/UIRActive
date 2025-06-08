package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.SportsVenue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SportVenueRepository extends JpaRepository<SportsVenue, Long> {
    @Query("SELECT COUNT(e) FROM SportsVenue e WHERE e.isActive = true")
    long countSportsVenue();
}