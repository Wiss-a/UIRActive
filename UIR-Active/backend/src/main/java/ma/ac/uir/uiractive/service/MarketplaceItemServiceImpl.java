package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.MarketplaceItemRepository;
import ma.ac.uir.uiractive.entity.MarketplaceItem;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class MarketplaceItemServiceImpl implements MarketplaceItemService {

    private final MarketplaceItemRepository marketplaceItemRepository;
    private final FileStorageService fileStorageService;

    public MarketplaceItemServiceImpl(MarketplaceItemRepository marketplaceItemRepository,
                                      FileStorageService fileStorageService) {
        this.marketplaceItemRepository = marketplaceItemRepository;
        this.fileStorageService = fileStorageService;
    }

    @Override
    public List<MarketplaceItem> getAllItems() {
        return marketplaceItemRepository.findAll();
    }

    @Override
    public MarketplaceItem getItemById(Long id) {
        return marketplaceItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
    }

    @Override
    public MarketplaceItem createItem(MarketplaceItem item, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.storeFile(imageFile);
            item.setImagePath(imagePath);
        }
        return marketplaceItemRepository.save(item);
    }

    @Override
    public MarketplaceItem updateItem(Long id, MarketplaceItem item, MultipartFile imageFile) {
        MarketplaceItem existingItem = getItemById(id);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imagePath = fileStorageService.storeFile(imageFile);
            existingItem.setImagePath(imagePath);
        }

        existingItem.setTitle(item.getTitle());
        existingItem.setDescription(item.getDescription());
        existingItem.setPrice(item.getPrice());
        existingItem.setQuantity(item.getQuantity());
        existingItem.setStatus(item.getStatus());
        existingItem.setCategory(item.getCategory());

        return marketplaceItemRepository.save(existingItem);
    }

    @Override
    public void deleteItem(Long id) {
        marketplaceItemRepository.deleteById(id);
    }

    @Override
    public MarketplaceItem updateItemStatus(Long id, String status) {
        MarketplaceItem item = getItemById(id);
        item.setStatus(status);
        return marketplaceItemRepository.save(item);
    }

    @Override
    public List<MarketplaceItem> getItemsByStatus(String status) {
        return marketplaceItemRepository.findByStatus(status);
    }

    @Override
    public List<MarketplaceItem> getItemsByCategory(Long categoryId) {
        return marketplaceItemRepository.findByCategoryId(categoryId);
    }

    @Override
    public List<MarketplaceItem> getItemsBySeller(Long sellerId) {
        return marketplaceItemRepository.findBySellerId(sellerId);
    }

    @Override
    public long countMarketplaceItems() {
        return marketplaceItemRepository.count();
    }
}