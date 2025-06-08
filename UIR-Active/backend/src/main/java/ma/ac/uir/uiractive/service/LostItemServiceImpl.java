package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.LostItemRepository;
import ma.ac.uir.uiractive.entity.LostItem;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class LostItemServiceImpl implements LostItemService {


    private final CloudinaryService cloudinaryService;
    private final LostItemRepository lostItemRepository;
    private final FileStorageService fileStorageService;

    public LostItemServiceImpl(CloudinaryService cloudinaryService, LostItemRepository lostItemRepository, FileStorageService fileStorageService) {
        this.cloudinaryService = cloudinaryService;
        this.lostItemRepository = lostItemRepository;
        this.fileStorageService = fileStorageService;
    }


//    public LostItem createLostItem(LostItem lostItem, MultipartFile imageFile) {
//        if (imageFile != null && !imageFile.isEmpty()) {
//            String imagePath = fileStorageService.storeFile(imageFile);
//            lostItem.setImagePath(imagePath);
//        }
//        return lostItemRepository.save(lostItem);
//    }
    // In your LostItemService.java
//private final String UPLOAD_DIR = "uploads/lost-items/";
//
//    public LostItem createLostItem(LostItem lostItem, MultipartFile imageFile) {
//        // Save the basic lost item first
//        LostItem saved = lostItemRepository.save(lostItem);
//
//        if (imageFile != null && !imageFile.isEmpty()) {
//            try {
//                // Create upload directory if it doesn't exist
//                Path uploadPath = Paths.get(UPLOAD_DIR);
//                if (!Files.exists(uploadPath)) {
//                    Files.createDirectories(uploadPath);
//                }
//
//                // Generate unique filename
//                String originalFileName = imageFile.getOriginalFilename();
//                String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
//                String uniqueFileName = UUID.randomUUID().toString() + "_" + UUID.randomUUID().toString().substring(0, 8) + fileExtension;
//
//                // Save file
//                Path filePath = uploadPath.resolve(uniqueFileName);
//                Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
//
//                // Update the lost item with image path
//                saved.setImagePath(uniqueFileName);
//                saved = lostItemRepository.save(saved);
//
//                System.out.println("✅ Image saved: " + filePath.toAbsolutePath());
//
//            } catch (IOException e) {
//                System.err.println("❌ Error saving image: " + e.getMessage());
//                e.printStackTrace();
//            }
//        }
//
//        return saved;
    //  }

    public LostItem createLostItem(LostItem lostItem, MultipartFile imageFile) {
        try {
            // Upload image to Cloudinary if provided
            if (imageFile != null && !imageFile.isEmpty()) {
                String imageUrl = cloudinaryService.uploadImage(imageFile, "lost-items");
                lostItem.setImageUrl(imageUrl);
                lostItem.setImagePath(null); // No longer need local path
            }

            lostItem.setCreatedAt(new Date());
            return lostItemRepository.save(lostItem);

        } catch (Exception e) {
            throw new RuntimeException("Failed to create lost item: " + e.getMessage(), e);
        }
    }

    public LostItem updateLostItem(Long id, LostItem updatedItem, MultipartFile imageFile) {
        LostItem existingItem = getLostItemById(id);

        // Update fields
        existingItem.setTitle(updatedItem.getTitle());
        existingItem.setLocation(updatedItem.getLocation());
        existingItem.setDescription(updatedItem.getDescription());
        existingItem.setContactInfo(updatedItem.getContactInfo());

        // Handle image update
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // Delete old image if exists
                if (existingItem.getImageUrl() != null) {
                    cloudinaryService.deleteImage(existingItem.getImageUrl());
                }

                // Upload new image
                String newImageUrl = cloudinaryService.uploadImage(imageFile, "lost-items");
                existingItem.setImageUrl(newImageUrl);
                existingItem.setImagePath(null);

            } catch (Exception e) {
                throw new RuntimeException("Failed to update image: " + e.getMessage(), e);
            }
        }

        return lostItemRepository.save(existingItem);
    }

    public void deleteLostItem(Long id) {
        LostItem lostItem = getLostItemById(id);

        // Delete image from Cloudinary if exists
        if (lostItem.getImageUrl() != null) {
            cloudinaryService.deleteImage(lostItem.getImageUrl());
        }

        lostItemRepository.delete(lostItem);
    }

    @Override
    public LostItem getLostItemById(Long id) {
        return lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lost item not found"));
    }

    @Override
    public List<LostItem> getAllLostItems() {
        return lostItemRepository.findAll();
    }

    @Override
    public List<LostItem> getLostItemsByStatus(String status) {
        return lostItemRepository.findByStatus(status);
    }

    @Override
    public List<LostItem> getLostItemsByReporter(Long reporterId) {
        return lostItemRepository.findByReporterId(reporterId);
    }

    @Override
    public List<LostItem> searchLostItemsByTitle(String title) {
        return lostItemRepository.findByTitleContainingIgnoreCase(title);
    }

    @Override
    public LostItem updateLostItemStatus(Long id, String status) {
        LostItem lostItem = getLostItemById(id);
        lostItem.setStatus(status);
        return lostItemRepository.save(lostItem);
    }
}
//    @Override
//    public LostItem updateLostItem(Long id, LostItem lostItemDetails, MultipartFile imageFile) {
//        LostItem lostItem = getLostItemById(id);
//
//        if (imageFile != null && !imageFile.isEmpty()) {
//            String imagePath = fileStorageService.storeFile(imageFile);
//            lostItem.setImagePath(imagePath);
//        }
//
//        lostItem.setTitle(lostItemDetails.getTitle());
//        lostItem.setLocation(lostItemDetails.getLocation());
//        lostItem.setDescription(lostItemDetails.getDescription());
//        lostItem.setStatus(lostItemDetails.getStatus());
//        lostItem.setContactInfo(lostItemDetails.getContactInfo());
//
//        return lostItemRepository.save(lostItem);
//    }

//    @Override
//    public void deleteLostItem(Long id) {
//        lostItemRepository.deleteById(id);
//    }
//}