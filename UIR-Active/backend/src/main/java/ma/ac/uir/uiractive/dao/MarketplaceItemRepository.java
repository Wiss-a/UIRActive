package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.MarketplaceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {
    List<MarketplaceItem> findByStatus(String status);
    List<MarketplaceItem> findByCategoryId(Long categoryId);
    @Query("SELECT mi FROM MarketplaceItem mi WHERE mi.seller.idU = :sellerId")
    List<MarketplaceItem> findBySellerId(@Param("sellerId") Long sellerId);
}