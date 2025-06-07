package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.MarketplaceItem;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MarketplaceItemService {
    List<MarketplaceItem> getAllItems();
    MarketplaceItem getItemById(Long id);
    MarketplaceItem createItem(MarketplaceItem item, MultipartFile imageFile);
    MarketplaceItem updateItem(Long id, MarketplaceItem item, MultipartFile imageFile);
    void deleteItem(Long id);
    MarketplaceItem updateItemStatus(Long id, String status);
    List<MarketplaceItem> getItemsByStatus(String status);
    List<MarketplaceItem> getItemsByCategory(Long categoryId);
    List<MarketplaceItem> getItemsBySeller(Long sellerId);
    long countMarketplaceItems();
}