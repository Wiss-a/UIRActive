package ma.ac.uir.uiractive.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(originPatterns = "*")
public class FileController {

    private final Path uploadLocation = Paths.get("uploads");

    @GetMapping("/lost-items/{filename:.+}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            Path filePath = uploadLocation.resolve("lost-items").resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                // Determine the file's content type
                String contentType = null;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException ex) {
                    System.err.println("Could not determine file type for: " + filename);
                }

                // Fallback to default content type if type could not be determined
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                System.err.println("File not found or not readable: " + filePath.toString());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception ex) {
            System.err.println("Error serving file " + filename + ": " + ex.getMessage());
            ex.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("File server is running");
    }
}