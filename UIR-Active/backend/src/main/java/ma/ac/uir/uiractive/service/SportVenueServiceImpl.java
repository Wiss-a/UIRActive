package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.SportVenueRepository;
import ma.ac.uir.uiractive.entity.SportsVenue;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Time;
import java.util.List;

@Service
public class SportVenueServiceImpl implements SportVenueService {
    private final SportVenueRepository venueRepository;
    private final FileStorageService fileStorageService;
    private final SportVenueRepository sportVenueRepository;

    public SportVenueServiceImpl(SportVenueRepository venueRepository,
                                 FileStorageService fileStorageService, SportVenueRepository sportVenueRepository) {
        this.venueRepository = venueRepository;
        this.fileStorageService = fileStorageService;
        this.sportVenueRepository = sportVenueRepository;
    }

    @Override
    public SportsVenue createVenue(
            String venueName,
            String type,
            String description,
            String location,
            int capacity,
            String openingTime,
            String closingTime,
            MultipartFile imageFile,
            String imageUrl
    ) {
        SportsVenue venue = new SportsVenue();
        venue.setVenueName(venueName);
        venue.setType(type);
        venue.setDescription(description);
        venue.setLocation(location);
        venue.setCapacity(capacity);
        venue.setOpeningTime(Time.valueOf(openingTime));
        venue.setClosingTime(Time.valueOf(closingTime));
        venue.setIsActive(true);

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(imageFile);
            venue.setImagePath(fileName);
            venue.setImageUrl(null);
        } else if (imageUrl != null && !imageUrl.isEmpty()) {
            venue.setImageUrl(imageUrl);
            venue.setImagePath(null);
        }

        return venueRepository.save(venue);
    }

    @Override
    public List<SportsVenue> getAllVenues() {
        return venueRepository.findAll();
    }

    @Override
    public SportsVenue getVenueById(Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
    }

    @Override
    public SportsVenue updateVenue(
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
    ) {
        SportsVenue venue = getVenueById(id);

        venue.setVenueName(venueName);
        venue.setType(type);
        venue.setDescription(description);
        venue.setLocation(location);
        venue.setCapacity(capacity);
        venue.setOpeningTime(Time.valueOf(openingTime));
        venue.setClosingTime(Time.valueOf(closingTime));
        venue.setIsActive(isActive);

        // Gestion de l'image
        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(imageFile);
            venue.setImagePath(fileName);
            venue.setImageUrl(null);
        } else if (imageUrl != null && !imageUrl.isEmpty()) {
            venue.setImageUrl(imageUrl);
            venue.setImagePath(null);
        } else {
            // Si aucune nouvelle image n'est fournie, on conserve l'ancienne
        }

        return venueRepository.save(venue);
    }

    @Override
    public SportsVenue updateVenueStatus(Long id, boolean isActive) {
        SportsVenue venue = getVenueById(id);
        venue.setIsActive(isActive);
        return venueRepository.save(venue);
    }

    @Override
    public Long countVenues() { return sportVenueRepository.countSportsVenue();
    }

    @Override
    public void deleteVenue(Long id) {
        SportsVenue venue = getVenueById(id);
        venueRepository.delete(venue);
    }
}