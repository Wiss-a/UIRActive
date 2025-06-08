package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.entity.SportsVenue;
import ma.ac.uir.uiractive.service.SportVenueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class SportVenueController {

    private final SportVenueService sportVenueService;

    public SportVenueController(SportVenueService sportVenueService) {
        this.sportVenueService = sportVenueService;
    }

    @GetMapping
    public ResponseEntity<List<SportsVenue>> getAllVenues() {
        List<SportsVenue> venues = sportVenueService.getAllVenues();
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SportsVenue> getVenueById(@PathVariable Long id) {
        SportsVenue venue = sportVenueService.getVenueById(id);
        return ResponseEntity.ok(venue);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SportsVenue> createVenue(
            @RequestParam("venueName") String venueName,
            @RequestParam("type") String type,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("location") String location,
            @RequestParam("capacity") int capacity,
            @RequestParam("openingTime") String openingTime,
            @RequestParam("closingTime") String closingTime,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {

        try {
            SportsVenue venue = sportVenueService.createVenue(
                    venueName,
                    type,
                    description,
                    location,
                    capacity,
                    openingTime,
                    closingTime,
                    imageFile,
                    imageUrl
            );
            return ResponseEntity.ok(venue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SportsVenue> updateVenue(
            @PathVariable Long id,
            @RequestParam("venueName") String venueName,
            @RequestParam("type") String type,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("location") String location,
            @RequestParam("capacity") int capacity,
            @RequestParam("openingTime") String openingTime,
            @RequestParam("closingTime") String closingTime,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "isActive", defaultValue = "true") boolean isActive) {

        try {
            SportsVenue venue = sportVenueService.updateVenue(
                    id,
                    venueName,
                    type,
                    description,
                    location,
                    capacity,
                    openingTime,
                    closingTime,
                    imageFile,
                    imageUrl,
                    isActive
            );
            return ResponseEntity.ok(venue);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVenue(@PathVariable Long id) {
        sportVenueService.deleteVenue(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SportsVenue> updateVenueStatus(
            @PathVariable Long id,
            @RequestParam("isActive") boolean isActive) {

        SportsVenue venue = sportVenueService.updateVenueStatus(id, isActive);
        return ResponseEntity.ok(venue);
    }
    @GetMapping("/count/venue")
    public ResponseEntity<Long> countVenues() {
        return ResponseEntity.ok(sportVenueService.countVenues());
    }
}