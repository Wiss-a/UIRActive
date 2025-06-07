package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.Matchup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchupRepository extends JpaRepository<Matchup, Long> {

    @Query("SELECT m FROM Matchup m WHERE (m.maxParticipants IS NULL OR size(m.participants) < m.maxParticipants)")
    List<Matchup> findNotFullMatchups();

}

