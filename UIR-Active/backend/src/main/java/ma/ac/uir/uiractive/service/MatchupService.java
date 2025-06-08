package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dto.CreateMatchupRequest;
import ma.ac.uir.uiractive.entity.Matchup;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface MatchupService {
    List<Matchup> getAllMatchups();
    Matchup getMatchupById(Long id);
    Matchup createMatchup(CreateMatchupRequest matchup);
    Matchup updateMatchup(Long id, Matchup matchup);
    void deleteMatchup(Long id);

    Matchup addParticipant(Long matchupId, Integer userId);
    Matchup closeMatchup(Long id);
    List<Matchup> getNotFullMatchups();

    // Add a method to remove a participant
    @Transactional
    Matchup removeParticipant(Long matchupId, Integer userId);

//    Matchup createMatchupWithCreatorId(Matchup matchup, Integer creatorId);
}