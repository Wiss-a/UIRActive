package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.AdminRepository;
import ma.ac.uir.uiractive.dao.SportEventRepository;
import ma.ac.uir.uiractive.dao.UserRepository;
import ma.ac.uir.uiractive.entity.SportEvent;
import ma.ac.uir.uiractive.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class SportEventServiceImpl implements SportEventService {

    private final SportEventRepository sportEventRepository;
    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public SportEventServiceImpl(SportEventRepository sportEventRepository,
                                 AdminRepository adminRepository,
                                 UserRepository userRepository,
                                 FileStorageService fileStorageService) {
        this.sportEventRepository = sportEventRepository;
        this.adminRepository = adminRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<SportEvent> getAllStudentEvents() {
        return sportEventRepository.findAllStudentEvents();
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        // Vérifier d'abord si l'événement existe
        SportEvent event = sportEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Événement non trouvé avec l'ID: " + id));

        // Supprimer l'événement
        sportEventRepository.delete(event);
    }

    @Override
    public List<SportEvent> getAllAdminEvents() {
        return sportEventRepository.findAllAdminEvents();
    }

    @Override
    public SportEvent createAdminEvent(
            String title,
            String description,
            Date eventDate,
            String location,
            String contactEmail,
            int maxParticipants,
            MultipartFile imageFile,
            String imageUrl,
            String creatorEmail) {

        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new RuntimeException("Email introuvable"));

        // Vérification que c'est bien un admin
        if (!adminRepository.existsById(creator.getIdU())) {
            throw new RuntimeException("Seuls les admins peuvent créer des événements admin");
        }

        SportEvent event = new SportEvent();
        event.setTitle(title);
        event.setDescription(description);
        event.setEventDate(eventDate);
        event.setLocation(location);
        event.setContactEmail(contactEmail);
        event.setMaxParticipants(maxParticipants > 0 ? maxParticipants : null);
        event.setCreator(creator);

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(imageFile);
            event.setImageUrl("/uploads/" + fileName);
        } else if (imageUrl != null && !imageUrl.isEmpty()) {
            event.setImageUrl(imageUrl);
        }

        return sportEventRepository.save(event);
    }

    @Override
    public SportEvent updateEvent(
            Long id,
            String title,
            String description,
            Date eventDate,
            String location,
            String contactEmail,
            int maxParticipants,
            MultipartFile imageFile,
            String imageUrl) {

        SportEvent event = sportEventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        event.setTitle(title);
        event.setDescription(description);
        event.setEventDate(eventDate);
        event.setLocation(location);
        event.setContactEmail(contactEmail);
        event.setMaxParticipants(maxParticipants > 0 ? maxParticipants : null);

        if (imageFile != null && !imageFile.isEmpty()) {
            String fileName = fileStorageService.storeFile(imageFile);
            event.setImageUrl("/uploads/" + fileName);
        } else if (imageUrl != null && !imageUrl.isEmpty()) {
            event.setImageUrl(imageUrl);
        }

        return sportEventRepository.save(event);
    }

    @Override
    public long countStudentEvents() {
        return sportEventRepository.countStudentEvents();
    }

    @Override
    public long countAdminEvents() {
        return sportEventRepository.countAdminEvents();
    }
}