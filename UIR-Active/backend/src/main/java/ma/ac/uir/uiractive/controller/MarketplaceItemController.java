package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.entity.MarketplaceItem;
import ma.ac.uir.uiractive.service.MarketplaceItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/marketplace")
@CrossOrigin(origins = "http://localhost:5173")
public class MarketplaceItemController {

    private final MarketplaceItemService marketplaceItemService;

    public MarketplaceItemController(MarketplaceItemService marketplaceItemService) {
        this.marketplaceItemService = marketplaceItemService;
    }

    @GetMapping
    public ResponseEntity<List<MarketplaceItem>> getAllItems() {
        return ResponseEntity.ok(marketplaceItemService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MarketplaceItem> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceItemService.getItemById(id));
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<MarketplaceItem> createItem(
            @RequestPart MarketplaceItem item,
            @RequestPart(required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(marketplaceItemService.createItem(item, imageFile));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<MarketplaceItem> updateItem(
            @PathVariable Long id,
            @RequestPart MarketplaceItem item,
            @RequestPart(required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(marketplaceItemService.updateItem(id, item, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        marketplaceItemService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MarketplaceItem> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(marketplaceItemService.updateItemStatus(id, status));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<MarketplaceItem>> getItemsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(marketplaceItemService.getItemsByStatus(status));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<MarketplaceItem>> getItemsByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(marketplaceItemService.getItemsByCategory(categoryId));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<MarketplaceItem>> getItemsBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(marketplaceItemService.getItemsBySeller(sellerId));
    }

    @GetMapping("/count")
    public long countMarketplaceItems() {
        return marketplaceItemService.countMarketplaceItems();
    }
}