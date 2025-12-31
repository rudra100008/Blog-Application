package com.blogrestapi.Dao;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.blogrestapi.Entity.Role;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Repository
public interface RoleDao extends MongoRepository<Role,Integer> {
    @Query("{ 'name' : ?0 }")
    Optional<Role> findRoleByName(String roleName);
}
