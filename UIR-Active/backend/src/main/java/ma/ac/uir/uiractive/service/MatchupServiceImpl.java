package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.MatchupRepository;
import ma.ac.uir.uiractive.dao.UserRepository;
import ma.ac.uir.uiractive.dto.CreateMatchupRequest;
import ma.ac.uir.uiractive.entity.Matchup;
import ma.ac.uir.uiractive.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static java.time.LocalDate.now;

@Service
@Transactional
public class MatchupServiceImpl implements MatchupService {

    private final MatchupRepository matchupRepository;
    private final UserRepository userRepository;
    public MatchupServiceImpl(MatchupRepository matchupRepository,
                              UserRepository userRepository) {
        this.matchupRepository = matchupRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Matchup> getAllMatchups() {
        return matchupRepository.findAll();
    }

    @Override
    public Matchup getMatchupById(Long id) {
        return matchupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matchup not found with ID: " + id));
    }

//    @Override
//    public Matchup createMatchup(Matchup matchup) {
//        matchup.setCreatedAt(new Date());
//        if (matchup.getParticipants() == null) {
//            matchup.setParticipants(new ArrayList<>());
//        }
//        return matchupRepository.save(matchup);
//    }
// And update your service method
public Matchup createMatchup(CreateMatchupRequest request) {
    // Fetch the creator from the database
    User creator = userRepository.findById(request.getCreatorId())
            .orElseThrow(() -> new RuntimeException("User not found with id: " + request.getCreatorId()));

    // Create the matchup entity
    Matchup matchup = new Matchup();
    matchup.setTitle(request.getTitle());
    matchup.setDescription(request.getDescription());
    matchup.setSport(request.getSport());
    matchup.setLocation(request.getLocation());
    matchup.setEventDate(request.getEventDate());
    matchup.setMaxParticipants(request.getMaxParticipants());
    matchup.setSkillLevel(request.getSkillLevel());
    matchup.setCreator(creator);
    matchup.setStatus("open");
    matchup.setCreatedAt(new Date());

    return matchupRepository.save(matchup);
}


    @Override
    public Matchup updateMatchup(Long id, Matchup updatedMatchup) {
        Matchup existing = getMatchupById(id);

        existing.setTitle(updatedMatchup.getTitle());
        existing.setDescription(updatedMatchup.getDescription());
        existing.setEventDate(updatedMatchup.getEventDate());
        existing.setLocation(updatedMatchup.getLocation());
        existing.setMaxParticipants(updatedMatchup.getMaxParticipants());
        existing.setContactEmail(updatedMatchup.getContactEmail());

        return matchupRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteMatchup(Long id) {
        // Check if matchup exists first
        Matchup matchup = matchupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matchup not found with ID: " + id));

        // Delete the matchup
        matchupRepository.delete(matchup);
    }

    @Override
    public Matchup addParticipant(Long matchupId, Integer userId) {
        Matchup matchup = getMatchupById(matchupId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        if (matchup.getParticipants() == null) {
            matchup.setParticipants(new ArrayList<>());
        }

        // Check if matchup is already full
        if (matchup.getMaxParticipants() != null &&
                matchup.getParticipants().size() >= matchup.getMaxParticipants()) {
            throw new RuntimeException("Matchup is already full");
        }

        // Check if user is not already a participant
        if (!matchup.getParticipants().contains(user)) {
            matchup.getParticipants().add(user);
        } else {
            throw new RuntimeException("User is already a participant in this matchup");
        }

        return matchupRepository.save(matchup);
    }

    @Override
    public Matchup closeMatchup(Long id) {
        Matchup matchup = getMatchupById(id);
        // Set max participants to current participant count to "close" the matchup
        matchup.setMaxParticipants(matchup.getParticipants() != null ?
                matchup.getParticipants().size() : 0);
        return matchupRepository.save(matchup);
    }

    @Override
    public List<Matchup> getNotFullMatchups() {
        return matchupRepository.findNotFullMatchups();
    }

//    @Override
//    // Add this method to your MatchupService class
//
//
//
//    public Matchup createMatchupWithCreatorId(Matchup matchup, Integer creatorId) {
//        // Fetch the creator from the database
//        User creator = userRepository.findById(creatorId)
//                .orElseThrow(() -> new RuntimeException("User not found with id: " + creatorId));
//
//        // Set the managed User entity as creator
//        matchup.setCreator(creator);
//
//        // Set default values if not provided
//        if (matchup.getStatus() == null) {
//            matchup.setStatus("open");
//        }
//
//        if (matchup.getCreatedAt() == null) {
//            matchup.setCreatedAt(new Date());
//        }
//
//        // Save and return the matchup
//        return matchupRepository.save(matchup);
//    }
}