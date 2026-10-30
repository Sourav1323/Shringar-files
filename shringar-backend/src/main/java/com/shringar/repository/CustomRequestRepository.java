package com.shringar.repository;

import com.shringar.model.CustomRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomRequestRepository extends JpaRepository<CustomRequest, Long> {
    Optional<CustomRequest> findByRequestReference(String requestReference);
    List<CustomRequest> findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(String customerEmail);
    List<CustomRequest> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);
    List<CustomRequest> findAllByOrderByCreatedAtDesc();
}
