package com.shringar.service;

import com.shringar.dto.request.ArtistApplicationRequest;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.ArtistApplication;
import com.shringar.repository.ArtistApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ArtistApplicationService {

    private final ArtistApplicationRepository repository;
    private final com.shringar.service.notification.EmailService emailService;

    @Transactional
    public ArtistApplication submit(ArtistApplicationRequest req) {
        ArtistApplication application = ArtistApplication.builder()
                .fullName(req.getFullName().trim())
                .email(req.getEmail().trim())
                .phone(req.getPhone().trim())
                .city(req.getCity().trim())
                .yearsExperience(req.getYearsExperience())
                .specialization(req.getSpecialization())
                .portfolioLink(req.getPortfolioLink())
                .message(req.getMessage())
                .status("PENDING")
                .build();

        application = repository.save(application);

        try {
            emailService.sendArtistApplicationNotification(application);
        } catch (Exception ignored) { }

        return application;
    }

    public List<ArtistApplication> getAll() {
        return repository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ArtistApplication updateStatus(Long id, String status, String adminNotes) {
        ArtistApplication application = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        if (!List.of("PENDING", "APPROVED", "REJECTED").contains(status)) {
            throw new BadRequestException("Status must be PENDING, APPROVED, or REJECTED");
        }

        application.setStatus(status);
        if (adminNotes != null) application.setAdminNotes(adminNotes);
        application.setReviewedAt(LocalDateTime.now());

        return repository.save(application);
    }
}
