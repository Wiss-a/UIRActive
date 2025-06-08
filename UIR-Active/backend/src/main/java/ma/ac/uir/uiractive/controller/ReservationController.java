package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.entity.Reservation;
import ma.ac.uir.uiractive.entity.SportsVenue;
import ma.ac.uir.uiractive.entity.Student;
import ma.ac.uir.uiractive.service.ReservationService;
import ma.ac.uir.uiractive.service.SportVenueService;
import ma.ac.uir.uiractive.service.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.sql.Time;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(
        originPatterns = {"http://localhost:*"},
        allowCredentials = "true",
        allowedHeaders = {"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)public class ReservationController {

    private final ReservationService reservationService;
    private final SportVenueService sportsVenueService;
    private final StudentService studentService;

    public ReservationController(ReservationService reservationService,
                                 SportVenueService sportsVenueService, StudentService studentService) {
        this.reservationService = reservationService;
        this.sportsVenueService = sportsVenueService;
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getAllReservations() {
        try {
            List<Reservation> reservations = reservationService.getAllReservations();
            List<ReservationResponseDTO> responseDTOs = reservations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            // Log the error for debugging
            System.err.println("Error fetching all reservations: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching reservations", e);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByStatus(@PathVariable String status) {
        try {
            List<Reservation> reservations = reservationService.getReservationsByStatus(status);
            List<ReservationResponseDTO> responseDTOs = reservations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching reservations by status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching reservations by status", e);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponseDTO> getReservationById(@PathVariable Long id) {
        try {
            Reservation reservation = reservationService.getReservationById(id);
            return ResponseEntity.ok(convertToDTO(reservation));
        } catch (Exception e) {
            System.err.println("Error fetching reservation by id: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching reservation", e);
        }
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@RequestBody Map<String, Object> request) {
        try {
            // Debug: Log received request data
            System.out.println("Request received: " + request);

            // Valider les données requises
            if (!request.containsKey("email") || !request.containsKey("venueId") ||
                    !request.containsKey("reservationDate") || !request.containsKey("startTime") ||
                    !request.containsKey("endTime")) {

                // Debug: Show which fields are missing
                StringBuilder missingFields = new StringBuilder("Champs manquants: ");
                if (!request.containsKey("email")) missingFields.append("email ");
                if (!request.containsKey("venueId")) missingFields.append("venueId ");
                if (!request.containsKey("reservationDate")) missingFields.append("reservationDate ");
                if (!request.containsKey("startTime")) missingFields.append("startTime ");
                if (!request.containsKey("endTime")) missingFields.append("endTime ");

                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Tous les champs sont requis (email, venueId, reservationDate, startTime, endTime)",
                        "debug", missingFields.toString()
                ));
            }

            // Créer la réservation
            Reservation reservation = new Reservation();

            // Récupérer l'utilisateur par email et le lieu par ID
            Optional<Student> studentOptional = studentService.getStudentByEmail(request.get("email").toString());
            if (studentOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Aucun étudiant trouvé avec cet email"
                ));
            }
            Student student = studentOptional.get();

            SportsVenue venue = sportsVenueService.getVenueById(Long.parseLong(request.get("venueId").toString()));
            if (venue == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "Lieu sportif introuvable"
                ));
            }

            reservation.setUser(student);
            reservation.setVenue(venue);
            reservation.setReservationDate(new SimpleDateFormat("yyyy-MM-dd").parse(request.get("reservationDate").toString()));
            reservation.setStartTime(Time.valueOf(request.get("startTime").toString() + ":00"));
            reservation.setEndTime(Time.valueOf(request.get("endTime").toString() + ":00"));
            reservation.setStatus("pending");

            Reservation createdReservation = reservationService.createReservation(reservation);

            // Create a response DTO to avoid lazy loading issues
            ReservationResponseDTO responseDTO = convertToDTO(createdReservation);

            return ResponseEntity.ok(responseDTO);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Format invalide pour venueId"
            ));
        } catch (ParseException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Format de date invalide. Utilisez yyyy-MM-dd"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Format d'heure invalide. Utilisez HH:mm"
            ));
        } catch (Exception e) {
            System.err.println("Error creating reservation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Erreur lors de la création de la réservation: " + e.getMessage()
            ));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservationResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            Reservation updatedReservation = reservationService.updateReservationStatus(id, status);
            return ResponseEntity.ok(convertToDTO(updatedReservation));
        } catch (Exception e) {
            System.err.println("Error updating reservation status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error updating reservation status", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        try {
            reservationService.deleteReservation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting reservation: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error deleting reservation", e);
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countAllReservations() {
        try {
            return ResponseEntity.ok(reservationService.countAllReservations());
        } catch (Exception e) {
            System.err.println("Error counting reservations: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error counting reservations", e);
        }
    }

    @GetMapping("/count/{status}")
    public ResponseEntity<Long> countReservationsByStatus(@PathVariable String status) {
        try {
            return ResponseEntity.ok(reservationService.countReservationsByStatus(status));
        } catch (Exception e) {
            System.err.println("Error counting reservations by status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error counting reservations by status", e);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponseDTO>> getReservationsByUser(@PathVariable Long userId) {
        try {
            List<Reservation> reservations = reservationService.getReservationsByUserId(userId);
            List<ReservationResponseDTO> responseDTOs = reservations.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching reservations by user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching reservations by user", e);
        }
    }

    // Helper method to safely convert Reservation to DTO
    private ReservationResponseDTO convertToDTO(Reservation reservation) {
        try {
            return new ReservationResponseDTO(reservation);
        } catch (Exception e) {
            System.err.println("Error converting reservation to DTO: " + e.getMessage());
            e.printStackTrace();
            // Return a minimal DTO if conversion fails
            ReservationResponseDTO dto = new ReservationResponseDTO();
            dto.id = reservation.getId();
            dto.reservationDate = reservation.getReservationDate();
            dto.startTime = reservation.getStartTime();
            dto.endTime = reservation.getEndTime();
            dto.status = reservation.getStatus();
            return dto;
        }
    }

    // Updated DTO classes with better error handling
    public static class ReservationResponseDTO {
        private Long id;
        private java.util.Date reservationDate;
        private Time startTime;
        private Time endTime;
        private String status;
        private StudentDTO user;
        private VenueDTO venue;

        // Default constructor
        public ReservationResponseDTO() {}

        public ReservationResponseDTO(Reservation reservation) {
            this.id = reservation.getId();
            this.reservationDate = reservation.getReservationDate();
            this.startTime = reservation.getStartTime();
            this.endTime = reservation.getEndTime();
            this.status = reservation.getStatus();

            // Safely create DTOs for nested objects to avoid lazy loading
            try {
                if (reservation.getUser() != null) {
                    this.user = new StudentDTO((Student) reservation.getUser());
                }
            } catch (Exception e) {
                System.err.println("Error loading user for reservation " + reservation.getId() + ": " + e.getMessage());
                this.user = new StudentDTO(); // Empty DTO
            }

            try {
                if (reservation.getVenue() != null) {
                    this.venue = new VenueDTO(reservation.getVenue());
                }
            } catch (Exception e) {
                System.err.println("Error loading venue for reservation " + reservation.getId() + ": " + e.getMessage());
                this.venue = new VenueDTO(); // Empty DTO
            }
        }

        // Getters
        public Long getId() { return id; }
        public java.util.Date getReservationDate() { return reservationDate; }
        public Time getStartTime() { return startTime; }
        public Time getEndTime() { return endTime; }
        public String getStatus() { return status; }
        public StudentDTO getUser() { return user; }
        public VenueDTO getVenue() { return venue; }
    }

    public static class StudentDTO {
        private Long idU;
        private String firstname;
        private String lastname;
        private String email;

        // Default constructor
        public StudentDTO() {
            this.idU = 0L;
            this.firstname = "Inconnu";
            this.lastname = "Inconnu";
            this.email = "";
        }

        public StudentDTO(Student student) {
            try {
                // Fix: Convert int to Long properly
                this.idU = Long.valueOf(student.getIdU());
                this.firstname = student.getFirstname() != null ? student.getFirstname() : "Inconnu";
                this.lastname = student.getLastname() != null ? student.getLastname() : "Inconnu";
                this.email = student.getEmail() != null ? student.getEmail() : "";
            } catch (Exception e) {
                System.err.println("Error creating StudentDTO: " + e.getMessage());
                e.printStackTrace();
                // Set default values on error
                this.idU = 0L;
                this.firstname = "Inconnu";
                this.lastname = "Inconnu";
                this.email = "";
            }
        }

        // Getters
        public Long getIdU() { return idU; }
        public String getFirstname() { return firstname; }
        public String getLastname() { return lastname; }
        public String getEmail() { return email; }
    }

    public static class VenueDTO {
        private Long id;
        private String venueName;
        private String location;
        private String type;

        // Default constructor
        public VenueDTO() {
            this.id = 0L;
            this.venueName = "Lieu inconnu";
            this.location = "";
            this.type = "";
        }

        public VenueDTO(SportsVenue venue) {
            try {
                this.id = venue.getId() != null ? venue.getId() : 0L;
                this.venueName = venue.getVenueName() != null ? venue.getVenueName() : "Lieu inconnu";
                this.location = venue.getLocation() != null ? venue.getLocation() : "";
                this.type = venue.getType() != null ? venue.getType() : "";
            } catch (Exception e) {
                System.err.println("Error creating VenueDTO: " + e.getMessage());
                this.id = 0L;
                this.venueName = "Lieu inconnu";
                this.location = "";
                this.type = "";
            }
        }

        // Getters
        public Long getId() { return id; }
        public String getVenueName() { return venueName; }
        public String getLocation() { return location; }
        public String getType() { return type; }
    }
}