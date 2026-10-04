package com.shringar.service;

import com.shringar.dto.request.CreateConcernRequest;
import com.shringar.dto.response.ConcernResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.CustomerConcern;
import com.shringar.model.User;
import com.shringar.repository.CustomerConcernRepository;
import com.shringar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerConcernService {

    private final CustomerConcernRepository concernRepository;
    private final UserRepository userRepository;

    @Transactional
    public ConcernResponse createConcern(CreateConcernRequest req, Long userId) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        CustomerConcern concern = CustomerConcern.builder()
                .user(user)
                .customerName(req.getCustomerName().trim())
                .customerEmail(req.getCustomerEmail().trim().toLowerCase())
                .customerPhone(req.getCustomerPhone() != null ? req.getCustomerPhone().trim() : null)
                .bookingReference(req.getBookingReference() != null && !req.getBookingReference().isBlank()
                        ? req.getBookingReference().trim() : null)
                .category(req.getCategory().trim())
                .subject(req.getSubject().trim())
                .message(req.getMessage().trim())
                .status("OPEN")
                .build();

        concern = concernRepository.save(concern);
        return toResponse(concern);
    }

    public List<ConcernResponse> getUserConcerns(Long userId, String email) {
        if (userId != null) {
            return concernRepository.findByUserIdOrderByCreatedAtDesc(userId)
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        if (email != null && !email.isBlank()) {
            return concernRepository.findByCustomerEmailOrderByCreatedAtDesc(email.trim().toLowerCase())
                    .stream().map(this::toResponse).collect(Collectors.toList());
        }
        return List.of();
    }

    public List<ConcernResponse> getAllConcerns(String status) {
        List<CustomerConcern> list;
        if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
            list = concernRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
        } else {
            list = concernRepository.findAllByOrderByCreatedAtDesc();
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ConcernResponse getConcernById(Long id) {
        CustomerConcern c = concernRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concern not found"));
        return toResponse(c);
    }

    @Transactional
    public ConcernResponse respondToConcern(Long id, String response, String status, String responderName) {
        CustomerConcern c = concernRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concern not found"));

        if (response != null && !response.isBlank()) {
            c.setAdminResponse(response.trim());
            c.setRespondedAt(LocalDateTime.now());
            c.setRespondedBy(responderName != null ? responderName : "Support Team");
        }
        if (status != null && !status.isBlank()) {
            c.setStatus(status.toUpperCase());
        } else {
            c.setStatus("RESOLVED");
        }

        c = concernRepository.save(c);
        return toResponse(c);
    }

    public ConcernResponse toResponse(CustomerConcern c) {
        return ConcernResponse.builder()
                .id(c.getId())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .customerName(c.getCustomerName())
                .customerEmail(c.getCustomerEmail())
                .customerPhone(c.getCustomerPhone())
                .bookingReference(c.getBookingReference())
                .category(c.getCategory())
                .subject(c.getSubject())
                .message(c.getMessage())
                .status(c.getStatus())
                .adminResponse(c.getAdminResponse())
                .respondedAt(c.getRespondedAt())
                .respondedBy(c.getRespondedBy())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
