package ma.ac.uir.uiractive.dao;

import ma.ac.uir.uiractive.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}