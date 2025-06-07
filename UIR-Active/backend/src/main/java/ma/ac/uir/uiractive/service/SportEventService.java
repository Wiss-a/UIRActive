package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.SportEvent;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.List;

public interface SportEventService {
    List<SportEvent> getAllStudentEvents();
    List<SportEvent> getAllAdminEvents();
    long countStudentEvents();
    long countAdminEvents();
    void deleteEvent(Long id);
    SportEvent createAdminEvent(
            String title,
            String description,
            Date eventDate,
            String location,
            String contactEmail,
            int maxParticipants,
            MultipartFile imageFile,
            String imageUrl,
            String creatorEmail);
    SportEvent updateEvent(
            Long id,
            String title,
            String description,
            Date eventDate,
            String location,
            String contactEmail,
            int maxParticipants,
            MultipartFile imageFile,
            String imageUrl);
}