package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.LostItemRepository;
import ma.ac.uir.uiractive.entity.LostItem;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class LostItemServiceImpl implements LostItemService {

    private final LostItemRepository lostItemRepository;
    private final FileStorageService fileStorageService;

    public LostItemServiceImpl(LostItemRepository lostItemRepository, FileStorageService fileStorageService) {
        this.lostItemRepository = lostItemRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public LostItem createLostItem(LostItem lostItem, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.storeFile(imageFile);
            lostItem.setImagePath(imagePath);
        }
        return lostItemRepository.save(lostItem);
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

    @Override
    public LostItem updateLostItem(Long id, LostItem lostItemDetails, MultipartFile imageFile) {
        LostItem lostItem = getLostItemById(id);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.storeFile(imageFile);
            lostItem.setImagePath(imagePath);
        }

        lostItem.setTitle(lostItemDetails.getTitle());
        lostItem.setLocation(lostItemDetails.getLocation());
        lostItem.setDescription(lostItemDetails.getDescription());
        lostItem.setStatus(lostItemDetails.getStatus());
        lostItem.setContactInfo(lostItemDetails.getContactInfo());

        return lostItemRepository.save(lostItem);
    }

    @Override
    public void deleteLostItem(Long id) {
        lostItemRepository.deleteById(id);
    }
}