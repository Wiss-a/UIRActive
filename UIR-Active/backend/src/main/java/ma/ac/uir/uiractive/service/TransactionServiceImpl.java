package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.dao.TransactionRepository;
import ma.ac.uir.uiractive.entity.Transaction;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionServiceImpl(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Override
    public Transaction createTransaction(Transaction transaction) {
        return transactionRepository.save(transaction);
    }

    @Override
    public Transaction getTransactionById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
    }

    @Override
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    @Override
    public List<Transaction> getTransactionsByBuyer(Long buyerId) {
        return transactionRepository.findByBuyerId(buyerId);
    }

    @Override
    public List<Transaction> getTransactionsBySeller(Long sellerId) {
        return transactionRepository.findBySellerId(sellerId);
    }

    @Override
    public List<Transaction> getTransactionsByItem(Long itemId) {
        return transactionRepository.findByItemId(itemId);
    }

    @Override
    public Transaction updateTransactionStatus(Long id, String status) {
        Transaction transaction = getTransactionById(id);
        transaction.setStatus(status);
        return transactionRepository.save(transaction);
    }

    @Override
    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    @Override
    public long countTodayTransactions() {
        return transactionRepository.countTodayTransactions();
    }

    @Override
    public long countTodayTransactionsByStatus(String status) {
        return transactionRepository.countTodayTransactionsByStatus(status);
    }

}