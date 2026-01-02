package com.blogrestapi.Controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import com.blogrestapi.DTO.CategoryDTO;
import com.blogrestapi.Service.CategoryService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryController {
    private final  CategoryService categoryService;

    //create category handler
    @PostMapping("/category")
    public ResponseEntity<?> postCategory(@Valid @RequestBody CategoryDTO categoryDTO,BindingResult result)
    {
        Map<String,Object> response=new HashMap<>();
        if(result.hasErrors())
        {
         Map<String ,Object> errors=new HashMap<>();

         result.getFieldErrors().forEach(field->errors.put(field.getField(),field.getDefaultMessage()));
         response.put("status", "CONFLICT(409)");
         response.put("message", errors);
         return ResponseEntity.status(HttpStatus.CONFLICT).body(response);   
        }
       CategoryDTO savedCategory= this.categoryService.createCategory(categoryDTO);
       return ResponseEntity.status(HttpStatus.CREATED).body(savedCategory);
    }
    //Get all category
    @GetMapping("/category")
    public ResponseEntity<?> getCategory()
    {
        List<CategoryDTO> getAllCaetgory=this.categoryService.getAllCategory();
        return ResponseEntity.ok(getAllCaetgory);
    }
    //Get Category from the ID
    @GetMapping("/category/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable("id") int id)
    {
        CategoryDTO categoryDTO=this.categoryService.getCategoryBYId(id);
        return ResponseEntity.status(HttpStatus.OK).body(categoryDTO);
    }
    //update category by id
    @PutMapping("/category/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable("id") int id,@Valid @RequestBody CategoryDTO categoryDTO
    ,BindingResult result)
    {
        Map<String,Object> response=new HashMap<>();
        if(result.hasErrors())
        {
         Map<String ,Object> errors=new HashMap<>();

         result.getFieldErrors().forEach(field->errors.put(field.getField(),field.getDefaultMessage()));
         response.put("status", "CONFLICT(409)");
         response.put("message", errors);
         return ResponseEntity.status(HttpStatus.CONFLICT).body(response);   
        }
        CategoryDTO updateCategory=this.categoryService.updateCategory(id, categoryDTO);
        return ResponseEntity.status(HttpStatus.OK).body(updateCategory);
    }
    //delete category by id
    @DeleteMapping("/category/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") int id)
    {
        this.categoryService.deleteCategory(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
