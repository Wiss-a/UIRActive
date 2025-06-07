package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.LostItem;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LostItemService {
    LostItem createLostItem(LostItem lostItem, MultipartFile imageFile);
    LostItem getLostItemById(Long id);
    List<LostItem> getAllLostItems();
    List<LostItem> getLostItemsByStatus(String status);
    List<LostItem> getLostItemsByReporter(Long reporterId);
    List<LostItem> searchLostItemsByTitle(String title);
    LostItem updateLostItemStatus(Long id, String status);
    LostItem updateLostItem(Long id, LostItem lostItem, MultipartFile imageFile);
    void deleteLostItem(Long id);
}