package ma.ac.uir.uiractive.controller;

import jakarta.servlet.http.HttpSession;
import ma.ac.uir.uiractive.entity.Admin;
import ma.ac.uir.uiractive.entity.SportEvent;
import ma.ac.uir.uiractive.service.AdminService;
import ma.ac.uir.uiractive.service.SportEventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(
        originPatterns = {"http://localhost:*"},
        allowCredentials = "true",
        allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class SportEventController {

    private final SportEventService sportEventService;
    private final AdminService adminService;

    public SportEventController(SportEventService sportEventService, AdminService adminService) {
        this.sportEventService = sportEventService;
        this.adminService = adminService;
    }

    @GetMapping("/student")
    public ResponseEntity<List<SportEvent>> getAllStudentEvents() {
        List<SportEvent> events = sportEventService.getAllAdminEvents();
        return ResponseEntity.ok(events);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id, HttpSession session) {
        // Add authentication check for delete operations
        Admin admin = adminService.getCurrentAdmin(session);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        sportEventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin")
    public ResponseEntity<List<SportEvent>> getAllAdminEvents(HttpSession session) {
        // Add authentication check
        Admin admin = adminService.getCurrentAdmin(session);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<SportEvent> events = sportEventService.getAllAdminEvents();
        return ResponseEntity.ok(events);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SportEvent> createEvent(
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("eventDate") String eventDateStr,
            @RequestParam("location") String location,
            @RequestParam(value = "contactEmail", required = false) String contactEmail,
            @RequestParam(value = "maxParticipants", defaultValue = "0") int maxParticipants,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            HttpSession session) {

        Admin admin = adminService.getCurrentAdmin(session);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            Date eventDate = dateFormat.parse(eventDateStr);

            SportEvent event = sportEventService.createAdminEvent(
                    title,
                    description,
                    eventDate,
                    location,
                    contactEmail,
                    maxParticipants,
                    imageFile,
                    imageUrl,
                    admin.getEmail()
            );
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SportEvent> updateEvent(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("eventDate") String eventDateStr,
            @RequestParam("location") String location,
            @RequestParam(value = "contactEmail", required = false) String contactEmail,
            @RequestParam(value = "maxParticipants", defaultValue = "0") int maxParticipants,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            HttpSession session) {

        // Add authentication check for update operations
        Admin admin = adminService.getCurrentAdmin(session);
        if (admin == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Use consistent date parsing format with seconds
            SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            Date eventDate = dateFormat.parse(eventDateStr);

            SportEvent event = sportEventService.updateEvent(
                    id,
                    title,
                    description,
                    eventDate,
                    location,
                    contactEmail,
                    maxParticipants,
                    imageFile,
                    imageUrl
            );
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/count/student")
    public ResponseEntity<Long> countStudentEvents() {
        return ResponseEntity.ok(sportEventService.countStudentEvents());
    }

    @GetMapping("/count/admin")
    public ResponseEntity<Long> countAdminEvents() {
        return ResponseEntity.ok(sportEventService.countAdminEvents());
    }
}