package ma.ac.uir.uiractive.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret) {

        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "format", "jpg",
                    "quality", "auto:good",
                    "fetch_format", "auto"
            );

            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), options);
            return result.get("secure_url").toString();

        } catch (IOException e) {
            throw new IOException("Failed to upload image to Cloudinary: " + e.getMessage(), e);
        }
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return;
        }

        try {
            // Extract public_id from Cloudinary URL
            String publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId != null) {
                cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            System.err.println("Failed to delete image from Cloudinary: " + e.getMessage());
        }
    }

    private String extractPublicIdFromUrl(String imageUrl) {
        if (imageUrl == null || !imageUrl.contains("cloudinary.com")) {
            return null;
        }

        try {
            String[] parts = imageUrl.split("/");
            String fileWithExtension = parts[parts.length - 1];
            return fileWithExtension.substring(0, fileWithExtension.lastIndexOf('.'));
        } catch (Exception e) {
            return null;
        }
    }
}