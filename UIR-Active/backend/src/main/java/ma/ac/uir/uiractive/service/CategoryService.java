package ma.ac.uir.uiractive.service;

import ma.ac.uir.uiractive.entity.Category;

import java.util.List;

public interface CategoryService {
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    Category createCategory(Category category);
}