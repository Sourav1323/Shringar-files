package com.shringar.repository;

import com.shringar.model.CustomerConcern;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerConcernRepository extends JpaRepository<CustomerConcern, Long> {
    List<CustomerConcern> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<CustomerConcern> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);
    List<CustomerConcern> findAllByOrderByCreatedAtDesc();
    List<CustomerConcern> findByStatusOrderByCreatedAtDesc(String status);
}
