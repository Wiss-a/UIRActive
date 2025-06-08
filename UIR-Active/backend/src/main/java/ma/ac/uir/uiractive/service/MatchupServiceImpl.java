package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.MatchupRepository;
import ma.ac.uir.uiractive.dao.UserRepository;
import ma.ac.uir.uiractive.dto.CreateMatchupRequest;
import ma.ac.uir.uiractive.entity.Matchup;
import ma.ac.uir.uiractive.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

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
        List<Matchup> matchups = matchupRepository.findAll();
        // Force initialization of participants and creator to avoid lazy loading issues
        matchups.forEach(matchup -> {
            if (matchup.getParticipants() != null) {
                matchup.getParticipants().size(); // Triggers lazy loading
                // Ensure all participant data is loaded
                matchup.getParticipants().forEach(participant -> {
                    participant.getIdU(); // Access username to ensure it's loaded
                });
            }
            if (matchup.getCreator() != null) {
                matchup.getCreator().getIdU(); // Ensure creator is loaded
            }
        });
        return matchups;
    }

    @Override
    @Transactional(readOnly = true)
    public Matchup getMatchupById(Long id) {
        Matchup matchup = matchupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Matchup not found with ID: " + id));

        // Force initialization of participants and their properties
        if (matchup.getParticipants() != null) {
            matchup.getParticipants().size(); // Trigger lazy loading
            // Ensure all participant data is fully loaded
            matchup.getParticipants().forEach(participant -> {
                participant.getFirstname();
                participant.getLastname();
                participant.getIdU(); // Ensure ID is accessible
            });
        }

        // Ensure creator is fully loaded
        if (matchup.getCreator() != null) {
            matchup.getCreator().getFirstname();
            matchup.getCreator().getLastname();
            matchup.getCreator().getIdU();
        }

        return matchup;
    }

    @Override
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
        matchup.setParticipants(new ArrayList<>()); // Initialize empty participants list

        Matchup savedMatchup = matchupRepository.save(matchup);

        // Ensure all relationships are properly loaded
        if (savedMatchup.getCreator() != null) {
            savedMatchup.getCreator().getIdU();
        }

        return savedMatchup;
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
    @Transactional
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

        // Check if user is not already a participant (compare by ID to avoid object comparison issues)
        boolean alreadyParticipant = matchup.getParticipants().stream()
               // .anyMatch(participant -> participant.getIdU().equals(user.getIdU()));
                .anyMatch(participant -> Objects.equals(participant.getIdU(), user.getIdU()));

        if (!alreadyParticipant) {
            matchup.getParticipants().add(user);
        } else {
            throw new RuntimeException("User is already a participant in this matchup");
        }

        Matchup savedMatchup = matchupRepository.save(matchup);

        // Force initialization of all participants for the response
        if (savedMatchup.getParticipants() != null) {
            savedMatchup.getParticipants().forEach(participant -> {
                participant.getFirstname();
                participant.getLastname();
                participant.getIdU();
            });
        }

        return savedMatchup;
    }

    @Override
    public Matchup closeMatchup(Long id) {
        Matchup matchup = getMatchupById(id);
        matchup.setStatus("closed");
        Matchup savedMatchup = matchupRepository.save(matchup);

        // Ensure participants are loaded
        if (savedMatchup.getParticipants() != null) {
            savedMatchup.getParticipants().forEach(participant -> {
                participant.getFirstname();
                participant.getLastname();
            });
        }

        return savedMatchup;
    }

    @Override
    public List<Matchup> getNotFullMatchups() {
        List<Matchup> matchups = matchupRepository.findNotFullMatchups();
        // Force initialization of participants and their data
        matchups.forEach(matchup -> {
            if (matchup.getParticipants() != null) {
                matchup.getParticipants().size();
                matchup.getParticipants().forEach(participant -> {
                    participant.getFirstname();
                    participant.getLastname();
                    participant.getIdU();
                });
            }
            if (matchup.getCreator() != null) {
                matchup.getCreator().getFirstname();
                matchup.getCreator().getLastname();
            }
        });
        return matchups;
    }

    // Add a method to remove a participant
    @Transactional
    @Override
    public Matchup removeParticipant(Long matchupId, Integer userId) {
        Matchup matchup = getMatchupById(matchupId);

        if (matchup.getParticipants() != null) {
            matchup.getParticipants().removeIf(participant -> Objects.equals(participant.getIdU(), userId));


        }

        Matchup savedMatchup = matchupRepository.save(matchup);

        // Ensure remaining participants are loaded
        if (savedMatchup.getParticipants() != null) {
            savedMatchup.getParticipants().forEach(participant -> {
                participant.getFirstname();
                participant.getLastname();
                participant.getIdU();
            });
        }

        return savedMatchup;
    }
}