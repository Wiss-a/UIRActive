package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.dto.CreateMatchupRequest;
import ma.ac.uir.uiractive.entity.Matchup;
import ma.ac.uir.uiractive.entity.User;
import ma.ac.uir.uiractive.service.MatchupService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matchups")
public class MatchupController {

    private final MatchupService matchupService;

    public MatchupController(MatchupService matchupService) {
        this.matchupService = matchupService;
    }

    @GetMapping
    public ResponseEntity<List<Matchup>> getAllMatchups() {
        List<Matchup> matchups = matchupService.getAllMatchups();
        return ResponseEntity.ok(matchups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Matchup> getMatchupById(@PathVariable Long id) {
        try {
            Matchup matchup = matchupService.getMatchupById(id);
            return ResponseEntity.ok(matchup);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

//    @PostMapping
//    public ResponseEntity<Matchup> createMatchup(@RequestBody Matchup matchup) {
//        try {
//            // Extract the creator ID from the incoming matchup
//            Integer creatorId = null;
//            if (matchup.getCreator() != null) {
//                creatorId = matchup.getCreator().getIdU();
//            }
//
//            if (creatorId == null) {
//                return ResponseEntity.badRequest().build();
//            }
//
//            // Create matchup with creator ID
//            Matchup created = matchupService.createMatchupWithCreatorId(matchup, creatorId);
//            return ResponseEntity.status(HttpStatus.CREATED).body(created);
//        } catch (RuntimeException e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }

    // Updated createMatchup method using DTO
    @PostMapping
    public ResponseEntity<Matchup> createMatchup(@RequestBody CreateMatchupRequest request) {
        try {
            if (request.getCreatorId() == null) {
                return ResponseEntity.badRequest().build();
            }

            Matchup created = matchupService.createMatchup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<Matchup> updateMatchup(
            @PathVariable Long id,
            @RequestBody Matchup matchup) {
        try {
            Matchup updated = matchupService.updateMatchup(id, matchup);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatchup(@PathVariable Long id) {
        try {
            matchupService.deleteMatchup(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/participants/{userId}")
    public ResponseEntity<Matchup> addParticipant(
            @PathVariable Long id,
            @PathVariable Integer userId) {
        try {
            Matchup updated = matchupService.addParticipant(id, userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<Matchup> closeMatchup(@PathVariable Long id) {
        try {
            Matchup closed = matchupService.closeMatchup(id);
            return ResponseEntity.ok(closed);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/not-full")
    public ResponseEntity<List<Matchup>> getNotFullMatchups() {
        List<Matchup> matchups = matchupService.getNotFullMatchups();
        return ResponseEntity.ok(matchups);
    }
}