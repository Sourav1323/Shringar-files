package com.shringar.service;

import com.shringar.dto.request.CreateCustomRequest;
import com.shringar.dto.request.QuoteCustomRequest;
import com.shringar.dto.response.CustomRequestResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.CustomRequest;
import com.shringar.repository.CustomRequestRepository;
import com.shringar.service.notification.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomRequestService {

    private final CustomRequestRepository customRequestRepository;
    private final EmailService emailService;

    @Transactional
    public CustomRequestResponse createCustomRequest(CreateCustomRequest request) {
        if (request.getCustomerName() == null || request.getCustomerName().isBlank()) {
            throw new BadRequestException("Customer name is required");
        }
        if (request.getCustomerPhone() == null || request.getCustomerPhone().isBlank()) {
            throw new BadRequestException("Customer phone is required");
        }

        String reference = generateCustomReference();

        CustomRequest entity = CustomRequest.builder()
                .requestReference(reference)
                .userId(request.getUserId())
                .customerName(request.getCustomerName().trim())
                .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : null)
                .customerPhone(request.getCustomerPhone().trim())
                .title(request.getTitle() != null ? request.getTitle().trim() : "Bespoke Bridal Design")
                .category(request.getCategory() != null ? request.getCategory() : "Bridal")
                .coverage(request.getCoverage() != null ? request.getCoverage() : "Full Hand")
                .description(request.getDescription())
                .referenceImageUrl(request.getReferenceImageUrl())
                .eventDate(request.getEventDate())
                .preferredTime(request.getPreferredTime())
                .city(request.getCity() != null ? request.getCity() : "Delhi NCR")
                .pincode(request.getPincode())
                .venueAddress(request.getVenueAddress())
                .status("PENDING_APPROVAL")
                .build();

        CustomRequest saved = customRequestRepository.save(entity);
        log.info("Saved custom mehendi request #{} ({}) for {}", saved.getId(), saved.getRequestReference(), saved.getCustomerName());

        // Send email alert to admin with full design requirements
        try {
            emailService.sendCustomRequestToAdmin(saved);
        } catch (Exception e) {
            log.error("Failed to queue custom request email to admin: {}", e.getMessage());
        }

        // Send confirmation email to customer
        try {
            if (saved.getCustomerEmail() != null && !saved.getCustomerEmail().isBlank()) {
                emailService.sendCustomRequestConfirmationToCustomer(saved);
            }
        } catch (Exception e) {
            log.error("Failed to queue custom request confirmation to customer: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    public List<CustomRequestResponse> getAllCustomRequests() {
        return customRequestRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public CustomRequestResponse getCustomRequest(Long id) {
        CustomRequest req = customRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Custom request not found with id: " + id));
        return toResponse(req);
    }

    public CustomRequestResponse getByReference(String reference) {
        CustomRequest req = customRequestRepository.findByRequestReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Custom request not found with reference: " + reference));
        return toResponse(req);
    }

    public List<CustomRequestResponse> getCustomerRequests(String email, String phone) {
        if (email != null && !email.isBlank()) {
            return customRequestRepository.findByCustomerEmailIgnoreCaseOrderByCreatedAtDesc(email.trim())
                    .stream().map(this::toResponse).toList();
        }
        if (phone != null && !phone.isBlank()) {
            return customRequestRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone.trim())
                    .stream().map(this::toResponse).toList();
        }
        return List.of();
    }

    @Transactional
    public CustomRequestResponse quoteCustomRequest(Long id, QuoteCustomRequest quote) {
        CustomRequest req = customRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Custom request not found with id: " + id));

        req.setQuotedPrice(quote.getQuotedPrice());
        req.setAdvanceRequired(quote.getAdvanceRequired() != null 
                ? quote.getAdvanceRequired() 
                : quote.getQuotedPrice().multiply(new java.math.BigDecimal("0.30")).setScale(0, java.math.RoundingMode.CEILING));
        req.setArtistAssigned(quote.getArtistAssigned());
        req.setAdminNotes(quote.getAdminNotes());
        req.setStatus("APPROVED_AWAITING_ADVANCE");

        CustomRequest saved = customRequestRepository.save(req);

        // Send quote notification to customer
        try {
            emailService.sendCustomRequestQuoteToCustomer(saved);
        } catch (Exception e) {
            log.error("Failed to queue custom request quote email to customer: {}", e.getMessage());
        }

        return toResponse(saved);
    }

    @Transactional
    public CustomRequestResponse rejectCustomRequest(Long id, String reason) {
        CustomRequest req = customRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Custom request not found with id: " + id));

        req.setStatus("REJECTED");
        req.setAdminNotes(reason != null ? reason : "Unable to accommodate custom specifications at this time.");

        return toResponse(customRequestRepository.save(req));
    }

    private String generateCustomReference() {
        int randomDigits = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "CUST-" + randomDigits;
    }

    private CustomRequestResponse toResponse(CustomRequest r) {
        return CustomRequestResponse.builder()
                .id(r.getId())
                .requestReference(r.getRequestReference())
                .userId(r.getUserId())
                .customerName(r.getCustomerName())
                .customerEmail(r.getCustomerEmail())
                .customerPhone(r.getCustomerPhone())
                .title(r.getTitle())
                .category(r.getCategory())
                .coverage(r.getCoverage())
                .description(r.getDescription())
                .referenceImageUrl(r.getReferenceImageUrl())
                .eventDate(r.getEventDate())
                .preferredTime(r.getPreferredTime())
                .city(r.getCity())
                .pincode(r.getPincode())
                .venueAddress(r.getVenueAddress())
                .status(r.getStatus())
                .quotedPrice(r.getQuotedPrice())
                .advanceRequired(r.getAdvanceRequired())
                .advancePaid(r.getAdvancePaid())
                .artistAssigned(r.getArtistAssigned())
                .adminNotes(r.getAdminNotes())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }
}
