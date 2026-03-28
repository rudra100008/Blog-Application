package com.blogrestapi.ServiceImpl;

import java.util.List;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.blogrestapi.DTO.CategoryDTO;
import com.blogrestapi.Dao.CategoryDao;
import com.blogrestapi.Entity.Category;
import com.blogrestapi.Exception.ResourceNotFoundException;
import com.blogrestapi.Service.CategoryService;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService{
    private final CategoryDao categoryDao;
    private final ModelMapper modelMapper;
    private final SequenceGeneratorService sequence;

    @Override
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
       categoryDTO.setCategoryId((int)sequence.generateSequence("category_sequence"));
       Category category=modelMapper.map(categoryDTO,Category.class);
       Category savedCategory=this.categoryDao.save(category);
       return modelMapper.map(savedCategory, CategoryDTO.class);
    }

    @Override
    public List<CategoryDTO> getAllCategory() {
         return this.categoryDao.findAll().stream()
        .map(category->modelMapper.map(category,CategoryDTO.class))
        .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO getCategoryBYId(int id) {
       return this.categoryDao.findById(id).map(category->modelMapper.map(category, CategoryDTO.class))
       .orElseThrow(()->new ResourceNotFoundException("Category not found with id: "+id));
    }

    //delete a category by id
    @Override
    public void deleteCategory(int id) {
      if (!this.categoryDao.existsById(id)) {
         throw new ResourceNotFoundException("Category not found with id: "+id);
      }
       this.categoryDao.deleteById(id);
    }

    //update the category with the id
    @Override
    public CategoryDTO updateCategory(int id, CategoryDTO categoryDTO) {
        Category category=this.categoryDao.findById(id)
        .orElseThrow(()->new ResourceNotFoundException("Category not found with id: "+id));
        category.setCategoryTitle(categoryDTO.getCategoryTitle());
       Category updatedCategory= this.categoryDao.save(category);
       return modelMapper.map(updatedCategory,CategoryDTO.class);
    }
    
}
