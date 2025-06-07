package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT mi FROM Transaction mi WHERE mi.buyer.idU = :buyerId")
    List<Transaction> findByBuyerId(@Param("buyerId") Long buyerId);
    @Query("SELECT mi FROM Transaction mi WHERE mi.seller.idU = :sellerId")
    List<Transaction> findBySellerId(@Param("sellerId") Long sellerId);
    List<Transaction> findByItemId(Long itemId);
    @Query("SELECT COUNT(t) FROM Transaction t WHERE DATE(t.transactionDate) = CURRENT_DATE")
    long countTodayTransactions();
    @Query("SELECT COUNT(t) FROM Transaction t WHERE DATE(t.transactionDate) = CURRENT_DATE AND t.status = :status")
    long countTodayTransactionsByStatus(@Param("status") String status);
}