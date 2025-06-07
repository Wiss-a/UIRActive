package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.Transaction;

import java.util.List;

public interface TransactionService {
    Transaction createTransaction(Transaction transaction);
    Transaction getTransactionById(Long id);
    List<Transaction> getAllTransactions();
    List<Transaction> getTransactionsByBuyer(Long buyerId);
    List<Transaction> getTransactionsBySeller(Long sellerId);
    List<Transaction> getTransactionsByItem(Long itemId);
    Transaction updateTransactionStatus(Long id, String status);
    void deleteTransaction(Long id);
    long countTodayTransactions();
    long countTodayTransactionsByStatus(String status);

}