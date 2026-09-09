package com.kimbia.backend.repository;

import com.kimbia.backend.entity.User;
import com.kimbia.backend.enums.AccountStatus;
import com.kimbia.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleOrderByCreatedAtDesc(Role role);
    List<User> findByRoleAndStatusOrderByCreatedAtDesc(Role role, AccountStatus status);
}
