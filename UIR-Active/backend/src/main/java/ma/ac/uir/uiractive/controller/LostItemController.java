package ma.ac.uir.uiractive.controller;

import ma.ac.uir.uiractive.entity.LostItem;
import ma.ac.uir.uiractive.service.LostItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/lost-items")
@CrossOrigin(origins = "http://localhost:5173")
public class LostItemController {

    private final LostItemService lostItemService;

    public LostItemController(LostItemService lostItemService) {
        this.lostItemService = lostItemService;
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<LostItem> createLostItem(
            @RequestPart LostItem lostItem,
            @RequestPart(required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(lostItemService.createLostItem(lostItem, imageFile));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LostItem> getLostItemById(@PathVariable Long id) {
        return ResponseEntity.ok(lostItemService.getLostItemById(id));
    }

    @GetMapping
    public ResponseEntity<List<LostItem>> getAllLostItems() {
        return ResponseEntity.ok(lostItemService.getAllLostItems());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<LostItem>> getLostItemsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(lostItemService.getLostItemsByStatus(status));
    }

    @GetMapping("/reporter/{reporterId}")
    public ResponseEntity<List<LostItem>> getLostItemsByReporter(@PathVariable Long reporterId) {
        return ResponseEntity.ok(lostItemService.getLostItemsByReporter(reporterId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<LostItem>> searchLostItemsByTitle(@RequestParam String title) {
        return ResponseEntity.ok(lostItemService.searchLostItemsByTitle(title));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<LostItem> updateLostItemStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(lostItemService.updateLostItemStatus(id, status));
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<LostItem> updateLostItem(
            @PathVariable Long id,
            @RequestPart LostItem lostItem,
            @RequestPart(required = false) MultipartFile imageFile) {
        return ResponseEntity.ok(lostItemService.updateLostItem(id, lostItem, imageFile));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLostItem(@PathVariable Long id) {
        lostItemService.deleteLostItem(id);
        return ResponseEntity.noContent().build();
    }
}