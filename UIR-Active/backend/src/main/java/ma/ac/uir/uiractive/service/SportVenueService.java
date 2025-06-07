package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.SportsVenue;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SportVenueService {
    SportsVenue createVenue(
            String venueName,
            String type,
            String description,
            String location,
            int capacity,
            String openingTime,
            String closingTime,
            MultipartFile imageFile,
            String imageUrl
    );

    List<SportsVenue> getAllVenues();
    SportsVenue getVenueById(Long id);

    SportsVenue updateVenue(
            Long id,
            String venueName,
            String type,
            String description,
            String location,
            int capacity,
            String openingTime,
            String closingTime,
            MultipartFile imageFile,
            String imageUrl,
            boolean isActive
    );

    void deleteVenue(Long id);
    SportsVenue updateVenueStatus(Long id, boolean isActive);
}