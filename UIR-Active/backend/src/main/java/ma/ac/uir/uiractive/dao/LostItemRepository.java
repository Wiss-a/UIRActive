package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {
    List<LostItem> findByStatus(String status);
    @Query("SELECT mi FROM LostItem mi WHERE mi.reporter.idU = :reporterId")
    List<LostItem> findByReporterId(@Param("reporterId") Long reporterId);
    List<LostItem> findByTitleContainingIgnoreCase(String title);
}