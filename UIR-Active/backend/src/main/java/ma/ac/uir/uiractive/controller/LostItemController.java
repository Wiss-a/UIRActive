package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.entity.LostItem;
import ma.ac.uir.uiractive.entity.Student;
import ma.ac.uir.uiractive.service.CloudinaryService;
import ma.ac.uir.uiractive.service.LostItemService;
import ma.ac.uir.uiractive.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/lost-items")
@CrossOrigin(originPatterns = "*")
public class LostItemController {

    private final LostItemService lostItemService;
    private final StudentService studentService;

    public LostItemController(LostItemService lostItemService, StudentService studentService) {
        this.lostItemService = lostItemService;
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<?> createLostItem(@RequestBody Map<String, Object> request) {
        try {
            // Debug: Log received request data
            System.out.println("Lost item request received: " + request);

            // Validate required fields
            if (!request.containsKey("email") || !request.containsKey("title") ||
                    !request.containsKey("location") || !request.containsKey("description")) {

                // Debug: Show which fields are missing
                StringBuilder missingFields = new StringBuilder("Missing fields: ");
                if (!request.containsKey("email")) missingFields.append("email ");
                if (!request.containsKey("title")) missingFields.append("title ");
                if (!request.containsKey("location")) missingFields.append("location ");
                if (!request.containsKey("description")) missingFields.append("description ");

                return ResponseEntity.badRequest().body(Map.of(
                        "message", "All fields are required (email, title, location, description)",
                        "debug", missingFields.toString()
                ));
            }

            // Create the lost item
            LostItem lostItem = new LostItem();

            // Get student by email
            Optional<Student> studentOptional = studentService.getStudentByEmail(request.get("email").toString());
            if (studentOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "No student found with this email"
                ));
            }
            Student student = studentOptional.get();

            lostItem.setReporter(student);
            lostItem.setTitle(request.get("title").toString());
            lostItem.setLocation(request.get("location").toString());
            lostItem.setDescription(request.get("description").toString());

            // Optional fields
            if (request.containsKey("contactInfo")) {
                lostItem.setContactInfo(request.get("contactInfo").toString());
            }

            // Set default status
            lostItem.setStatus("reported");

            LostItem createdLostItem = lostItemService.createLostItem(lostItem, null);

            // Create a response DTO to avoid lazy loading issues
            LostItemResponseDTO responseDTO = convertToDTO(createdLostItem);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.err.println("Error creating lost item: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Error creating lost item: " + e.getMessage()
            ));
        }
    }

    // Fixed Spring Boot Controller methods for better image handling
// Add these methods to your LostItemController.java

    @PostMapping(value = "/with-image", consumes = {"multipart/form-data"})
    public ResponseEntity<?> createLostItemWithImage(
            @RequestParam String email,
            @RequestParam String title,
            @RequestParam String location,
            @RequestParam String description,
            @RequestParam(required = false) String contactInfo,
            @RequestPart(required = false) MultipartFile imageFile) {
        try {
            // Debug logging
            System.out.println("📤 Received multipart request:");
            System.out.println("  Email: " + email);
            System.out.println("  Title: " + title);
            System.out.println("  Location: " + location);
            System.out.println("  Description: " + description);
            System.out.println("  ContactInfo: " + contactInfo);

            if (imageFile != null) {
                System.out.println("  Image file:");
                System.out.println("    Name: " + imageFile.getOriginalFilename());
                System.out.println("    Size: " + imageFile.getSize());
                System.out.println("    Type: " + imageFile.getContentType());
                System.out.println("    Empty: " + imageFile.isEmpty());
            } else {
                System.out.println("  No image file received");
            }

            // Get student by email
            Optional<Student> studentOptional = studentService.getStudentByEmail(email);
            if (studentOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", "No student found with this email"
                ));
            }
            Student student = studentOptional.get();

            // Create the lost item
            LostItem lostItem = new LostItem();
            lostItem.setReporter(student);
            lostItem.setTitle(title);
            lostItem.setLocation(location);
            lostItem.setDescription(description);
            lostItem.setContactInfo(contactInfo);
            lostItem.setStatus("reported");

            // Create the lost item with the service
            LostItem createdLostItem = lostItemService.createLostItem(lostItem, imageFile);

            System.out.println("✅ Lost item created with ID: " + createdLostItem.getId());
            if (createdLostItem.getImagePath() != null) {
                System.out.println("✅ Image saved as: " + createdLostItem.getImagePath());
            }

            // Create a response DTO
            LostItemResponseDTO responseDTO = convertToDTO(createdLostItem);

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            System.err.println("❌ Error creating lost item with image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "message", "Error creating lost item: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostItemResponseDTO> getLostItemById(@PathVariable Long id) {
        try {
            LostItem lostItem = lostItemService.getLostItemById(id);
            return ResponseEntity.ok(convertToDTO(lostItem));
        } catch (Exception e) {
            System.err.println("Error fetching lost item by id: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching lost item", e);
        }
    }

    @GetMapping
    public ResponseEntity<List<LostItemResponseDTO>> getAllLostItems() {
        try {
            List<LostItem> lostItems = lostItemService.getAllLostItems();
            List<LostItemResponseDTO> responseDTOs = lostItems.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching all lost items: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching lost items", e);
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LostItemResponseDTO>> getLostItemsByStatus(@PathVariable String status) {
        try {
            List<LostItem> lostItems = lostItemService.getLostItemsByStatus(status);
            List<LostItemResponseDTO> responseDTOs = lostItems.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching lost items by status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching lost items by status", e);
        }
    }

    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<LostItemResponseDTO>> getLostItemsByReporter(@PathVariable Long reporterId) {
        try {
            List<LostItem> lostItems = lostItemService.getLostItemsByReporter(reporterId);
            List<LostItemResponseDTO> responseDTOs = lostItems.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching lost items by reporter: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching lost items by reporter", e);
        }
    }

    @GetMapping("/user/{userEmail}")
    public ResponseEntity<List<LostItemResponseDTO>> getLostItemsByUserEmail(@PathVariable String userEmail) {
        try {
            Optional<Student> studentOptional = studentService.getStudentByEmail(userEmail);
            if (studentOptional.isEmpty()) {
                return ResponseEntity.badRequest().body(null);
            }

            List<LostItem> lostItems = lostItemService.getLostItemsByReporter(Long.valueOf(studentOptional.get().getIdU()));
            List<LostItemResponseDTO> responseDTOs = lostItems.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error fetching lost items by user email: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error fetching lost items by user email", e);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<LostItemResponseDTO>> searchLostItemsByTitle(@RequestParam String title) {
        try {
            List<LostItem> lostItems = lostItemService.searchLostItemsByTitle(title);
            List<LostItemResponseDTO> responseDTOs = lostItems.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(responseDTOs);
        } catch (Exception e) {
            System.err.println("Error searching lost items: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error searching lost items", e);
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LostItemResponseDTO> updateLostItemStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            LostItem updatedLostItem = lostItemService.updateLostItemStatus(id, status);
            return ResponseEntity.ok(convertToDTO(updatedLostItem));
        } catch (Exception e) {
            System.err.println("Error updating lost item status: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error updating lost item status", e);
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<LostItemResponseDTO> updateLostItem(
            @PathVariable Long id,
            @RequestPart LostItem lostItem,
            @RequestPart(required = false) MultipartFile imageFile) {
        try {
            LostItem updatedLostItem = lostItemService.updateLostItem(id, lostItem, imageFile);
            return ResponseEntity.ok(convertToDTO(updatedLostItem));
        } catch (Exception e) {
            System.err.println("Error updating lost item: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error updating lost item", e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLostItem(@PathVariable Long id) {
        try {
            lostItemService.deleteLostItem(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.err.println("Error deleting lost item: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error deleting lost item", e);
        }
    }

    // Helper method to safely convert LostItem to DTO

//    private LostItemResponseDTO convertToDTO(LostItem lostItem) {
//        try {
//            LostItemResponseDTO dto = new LostItemResponseDTO(lostItem);
//
//            // FIXED: Better image URL construction
//            String baseUrl = "http://192.168.1.108:8082"; // Make this configurable
//
//            // Debug logging
//            System.out.println("🔄 Converting to DTO for item ID: " + lostItem.getId());
//            System.out.println("  Original imagePath: " + lostItem.getImagePath());
//            System.out.println("  Original imageUrl: " + lostItem.getImageUrl());
//
//            if (lostItem.getImagePath() != null && !lostItem.getImagePath().trim().isEmpty()) {
//                String imagePath = lostItem.getImagePath().trim();
//
//                // Construct the full URL
//                String fullImageUrl = baseUrl + "/uploads/lost-items/" + imagePath;
//
//                // Set both imagePath and imageUrl in the DTO
//                dto.setImagePath(imagePath);
//                dto.setImageUrl(fullImageUrl);
//
//                System.out.println("✅ Set image URLs:");
//                System.out.println("  imagePath: " + imagePath);
//                System.out.println("  imageUrl: " + fullImageUrl);
//            } else {
//                System.out.println("ℹ️ No image path found for item ID: " + lostItem.getId());
//            }
//
//            return dto;
//        } catch (Exception e) {
//            System.err.println("❌ Error converting lost item to DTO: " + e.getMessage());
//            e.printStackTrace();
//
//            // Return a minimal DTO if conversion fails
//            LostItemResponseDTO dto = new LostItemResponseDTO();
//            dto.setId(lostItem.getId());
//            dto.setTitle(lostItem.getTitle());
//            dto.setLocation(lostItem.getLocation());
//            dto.setDescription(lostItem.getDescription());
//            dto.setStatus(lostItem.getStatus());
//            dto.setCreatedAt(lostItem.getCreatedAt());
//            return dto;
//        }
//    }
private LostItemResponseDTO convertToDTO(LostItem lostItem) {
    try {
        LostItemResponseDTO dto = new LostItemResponseDTO(lostItem);

        // With Cloudinary, imageUrl is the direct URL
        if (lostItem.getImageUrl() != null && !lostItem.getImageUrl().trim().isEmpty()) {
            dto.setImageUrl(lostItem.getImageUrl());
            dto.setImagePath(null); // Not needed with Cloudinary
        }
        // Legacy support for local files (if you still have some)
        else if (lostItem.getImagePath() != null && !lostItem.getImagePath().trim().isEmpty()) {
            String baseUrl = "http://192.168.1.108:8082";
            String fullImageUrl = baseUrl + "/uploads/lost-items/" + lostItem.getImagePath();
            dto.setImagePath(lostItem.getImagePath());
            dto.setImageUrl(fullImageUrl);
        }

        return dto;
    } catch (Exception e) {
        System.err.println("❌ Error converting lost item to DTO: " + e.getMessage());
        // Return minimal DTO on error
        LostItemResponseDTO dto = new LostItemResponseDTO();
        dto.setId(lostItem.getId());
        dto.setTitle(lostItem.getTitle());
        dto.setLocation(lostItem.getLocation());
        dto.setDescription(lostItem.getDescription());
        dto.setStatus(lostItem.getStatus());
        dto.setCreatedAt(lostItem.getCreatedAt());
        return dto;
    }
}

    // DTO class for response
    public static class LostItemResponseDTO {
        private Long id;
        private String title;
        private String location;
        private String description;
        private String status;
        private String contactInfo;
        private java.util.Date createdAt;
        private String imageUrl;
        private String imagePath;
        private StudentDTO reporter;

        // Default constructor
        public LostItemResponseDTO() {}

        public LostItemResponseDTO(LostItem lostItem) {
            this.id = lostItem.getId();
            this.title = lostItem.getTitle();
            this.location = lostItem.getLocation();
            this.description = lostItem.getDescription();
            this.status = lostItem.getStatus();
            this.contactInfo = lostItem.getContactInfo();
            this.createdAt = lostItem.getCreatedAt();
            this.imageUrl = lostItem.getImageUrl();
            this.imagePath = lostItem.getImagePath();

            // Safely create DTO for reporter to avoid lazy loading
            try {
                if (lostItem.getReporter() != null) {
                    this.reporter = new StudentDTO(lostItem.getReporter());
                }
            } catch (Exception e) {
                System.err.println("Error loading reporter for lost item " + lostItem.getId() + ": " + e.getMessage());
                this.reporter = new StudentDTO(); // Empty DTO
            }
        }

        // Getters
        public Long getId() { return id; }
        public String getTitle() { return title; }
        public String getLocation() { return location; }
        public String getDescription() { return description; }
        public String getStatus() { return status; }
        public String getContactInfo() { return contactInfo; }
        public java.util.Date getCreatedAt() { return createdAt; }
        public String getImageUrl() { return imageUrl; }
        public String getImagePath() { return imagePath; }
        public StudentDTO getReporter() { return reporter; }
        public void setId(Long id) { this.id = id; }
        public void setTitle(String title) { this.title = title; }
        public void setLocation(String location) { this.location = location; }
        public void setDescription(String description) { this.description = description; }
        public void setStatus(String status) { this.status = status; }
        public void setContactInfo(String contactInfo) { this.contactInfo = contactInfo; }
        public void setCreatedAt(java.util.Date createdAt) { this.createdAt = createdAt; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public void setImagePath(String imagePath) { this.imagePath = imagePath; }
        public void setReporter(StudentDTO reporter) { this.reporter = reporter; }
    }

    public static class StudentDTO {
        private Long idU;
        private String firstname;
        private String lastname;
        private String email;

        // Default constructor
        public StudentDTO() {
            this.idU = 0L;
            this.firstname = "Unknown";
            this.lastname = "Unknown";
            this.email = "";
        }

        public StudentDTO(Student student) {
            try {
                this.idU = Long.valueOf(student.getIdU());
                this.firstname = student.getFirstname() != null ? student.getFirstname() : "Unknown";
                this.lastname = student.getLastname() != null ? student.getLastname() : "Unknown";
                this.email = student.getEmail() != null ? student.getEmail() : "";
            } catch (Exception e) {
                System.err.println("Error creating StudentDTO: " + e.getMessage());
                e.printStackTrace();
                // Set default values on error
                this.idU = 0L;
                this.firstname = "Unknown";
                this.lastname = "Unknown";
                this.email = "";
            }
        }

        // Getters
        public Long getIdU() { return idU; }
        public String getFirstname() { return firstname; }
        public String getLastname() { return lastname; }
        public String getEmail() { return email; }
    }
}