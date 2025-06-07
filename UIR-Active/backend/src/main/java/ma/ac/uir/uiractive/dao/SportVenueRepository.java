package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.SportsVenue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SportVenueRepository extends JpaRepository<SportsVenue, Long> {
}