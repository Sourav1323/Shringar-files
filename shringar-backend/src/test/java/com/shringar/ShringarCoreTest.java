package com.shringar;

import com.shringar.dto.request.*;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.*;
import com.shringar.model.enums.BookingStatus;
import com.shringar.model.enums.CouponType;
import com.shringar.model.enums.PreferredTime;
import com.shringar.model.enums.Role;
import com.shringar.repository.*;
import com.shringar.security.JwtUtil;
import com.shringar.service.AuthService;
import com.shringar.service.CartService;
import com.shringar.service.OtpService;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

public class ShringarCoreTest {

    private Validator validator;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private DesignRepository designRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @Mock
    private OtpService otpService;

    @InjectMocks
    private AuthService authService;

    @InjectMocks
    private CartService cartService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    // ─────────────────────── Auth - Signup (TC-AS-01 to TC-AS-09) ───────────────────────

    @Test
    @DisplayName("TC-AS-02: Signup fails when first name is blank")
    void testSignupBlankFirstName() {
        SignupRequest req = new SignupRequest();
        req.setFirstName("");
        req.setEmail("priya@test.com");
        req.setPassword("Passw0rd1");

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Should fail validation for blank first name");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("First name is required")));
    }

    @Test
    @DisplayName("TC-AS-03: Signup fails with invalid email format")
    void testSignupInvalidEmail() {
        SignupRequest req = new SignupRequest();
        req.setFirstName("Priya");
        req.setEmail("priya.test.com");
        req.setPassword("Passw0rd1");

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Should fail validation for invalid email");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Enter a valid email")));
    }

    @Test
    @DisplayName("TC-AS-05: Signup fails when password < 8 characters")
    void testSignupShortPassword() {
        SignupRequest req = new SignupRequest();
        req.setFirstName("Priya");
        req.setEmail("priya@test.com");
        req.setPassword("Pass1!2"); // 7 chars

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty(), "Should fail validation for password < 8 chars");
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Password must be at least 8 characters")));
    }

    @Test
    @DisplayName("TC-AS-06: Signup accepts exactly 8 characters")
    void testSignupExact8CharPassword() {
        SignupRequest req = new SignupRequest();
        req.setFirstName("Priya");
        req.setEmail("priya@test.com");
        req.setPassword("Passwor1"); // 8 chars

        var violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "Should pass validation with 8-char password");
    }

    @Test
    @DisplayName("TC-AS-09: checkExists returns true for registered email and phone")
    void testCheckExists() {
        when(userRepository.existsByEmail("priya@test.com")).thenReturn(true);
        when(userRepository.existsByPhone("9876543210")).thenReturn(true);

        Map<String, Boolean> result = authService.checkExists("priya@test.com", "9876543210");
        assertTrue(result.get("emailExists"));
        assertTrue(result.get("email"));
        assertTrue(result.get("phoneExists"));
        assertTrue(result.get("phone"));
    }

    // ─────────────────────── Auth - Login (TC-AL-01 to TC-AL-06) ───────────────────────

    @Test
    @DisplayName("TC-AL-04: Login fails for non-existent user with BadCredentialsException (401)")
    void testLoginNonExistentUserThrowsBadCredentials() {
        LoginRequest req = new LoginRequest();
        req.setIdentifier("ghost@test.com");
        req.setPassword("AnyPass123");

        when(userRepository.findByEmail("ghost@test.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> authService.login(req),
                "Non-existent user must throw BadCredentialsException (401) to prevent user enumeration");
    }

    @Test
    @DisplayName("TC-AL-05 & 06: Login fails when identifier or password is blank")
    void testLoginBlankValidation() {
        LoginRequest req1 = new LoginRequest();
        req1.setIdentifier("");
        req1.setPassword("Passw0rd1");
        assertFalse(validator.validate(req1).isEmpty());

        LoginRequest req2 = new LoginRequest();
        req2.setIdentifier("priya@test.com");
        req2.setPassword("");
        assertFalse(validator.validate(req2).isEmpty());
    }

    // ─────────────────────── Cart (TC-C-01 to TC-C-09) ───────────────────────

    @Test
    @DisplayName("TC-C-02 & TC-C-03: AddToCart fails when designId is null or quantity < 1")
    void testAddToCartValidation() {
        AddToCartRequest req1 = new AddToCartRequest();
        req1.setDesignId(null);
        req1.setQuantity(1);
        assertFalse(validator.validate(req1).isEmpty());

        AddToCartRequest req2 = new AddToCartRequest();
        req2.setDesignId(1L);
        req2.setQuantity(0);
        assertFalse(validator.validate(req2).isEmpty());
    }

    @Test
    @DisplayName("TC-C-07: Remove non-existent cart item throws ResourceNotFoundException (404)")
    void testRemoveNonExistentCartItem() {
        Long userId = 1L;
        Long badItemId = 999999L;

        User user = User.builder().id(userId).email("user@test.com").build();
        Cart cart = Cart.builder().id(10L).user(user).items(new ArrayList<>()).build();

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(badItemId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.removeFromCart(userId, badItemId));
    }

    // ─────────────────────── Coupons (TC-C-10 to TC-C-16) ───────────────────────

    @Test
    @DisplayName("TC-C-12: Apply coupon fails when code is blank")
    void testApplyCouponBlankCode() {
        ApplyCouponRequest req = new ApplyCouponRequest();
        req.setCode("");
        assertFalse(validator.validate(req).isEmpty());
    }

    // ─────────────────────── Booking (TC-B-01 to TC-B-13) ───────────────────────

    @Test
    @DisplayName("TC-B-02: Booking fails with past appointment date")
    void testBookingPastDate() {
        CreateBookingRequest req = CreateBookingRequest.builder()
                .artistId(1L)
                .appointmentDate(LocalDate.now().minusDays(1))
                .preferredTime(PreferredTime.MORNING)
                .city("Jaipur")
                .area("Vaishali Nagar")
                .fullAddress("House 123, Street 4")
                .pincode("302021")
                .customerName("Priya")
                .customerPhone("9876543210")
                .build();

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Appointment date cannot be in the past")));
    }

    @Test
    @DisplayName("TC-B-03: Booking accepts today's appointment date (FutureOrPresent)")
    void testBookingTodayDate() {
        CreateBookingRequest req = CreateBookingRequest.builder()
                .artistId(1L)
                .appointmentDate(LocalDate.now())
                .preferredTime(PreferredTime.MORNING)
                .city("Jaipur")
                .area("Vaishali Nagar")
                .fullAddress("House 123, Street 4")
                .pincode("302021")
                .customerName("Priya")
                .customerPhone("9876543210")
                .build();

        var violations = validator.validate(req);
        assertTrue(violations.isEmpty(), "Today's appointment date should be valid");
    }

    @Test
    @DisplayName("TC-B-04: Booking fails with invalid PIN code (e.g. 012345, 1234, ABCDE)")
    void testBookingInvalidPincode() {
        CreateBookingRequest req = CreateBookingRequest.builder()
                .artistId(1L)
                .appointmentDate(LocalDate.now().plusDays(2))
                .preferredTime(PreferredTime.MORNING)
                .city("Jaipur")
                .area("Vaishali Nagar")
                .fullAddress("House 123, Street 4")
                .pincode("012345") // Leading zero invalid in India
                .customerName("Priya")
                .customerPhone("9876543210")
                .build();

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("valid 6-digit Indian PIN code")));
    }

    @Test
    @DisplayName("TC-B-05: Booking fails with phone not exactly 10 digits")
    void testBookingInvalidPhoneLength() {
        CreateBookingRequest req = CreateBookingRequest.builder()
                .artistId(1L)
                .appointmentDate(LocalDate.now().plusDays(2))
                .preferredTime(PreferredTime.MORNING)
                .city("Jaipur")
                .area("Vaishali Nagar")
                .fullAddress("House 123, Street 4")
                .pincode("302021")
                .customerName("Priya")
                .customerPhone("98765") // 5 digits
                .build();

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("exactly 10 digits")));
    }

    // ─────────────────────── Custom Requests (TC-CR-01 to TC-CR-08) ───────────────────────

    @Test
    @DisplayName("TC-CR-02, 03, 04: Custom request fails without name, phone, or title")
    void testCustomRequestBlankValidations() {
        CreateCustomRequest req = new CreateCustomRequest();
        req.setCustomerName("");
        req.setCustomerPhone("");
        req.setTitle("");

        var violations = validator.validate(req);
        assertEquals(3, violations.size());
    }

    // ─────────────────────── Artist Applications (TC-AA-01 to TC-AA-05) ───────────────────────

    @Test
    @DisplayName("TC-AA-02: Artist application fails with invalid email")
    void testArtistApplicationInvalidEmail() {
        ArtistApplicationRequest req = new ArtistApplicationRequest();
        req.setFullName("Asha");
        req.setEmail("asha.test.com");
        req.setPhone("9876543210");
        req.setCity("Jaipur");

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("valid email address")));
    }

    // ─────────────────────── Customer Concerns (TC-CC-01 to TC-CC-04) ───────────────────────

    @Test
    @DisplayName("TC-CC-02 & TC-CC-03: Concern validation on email, subject, message")
    void testConcernValidations() {
        CreateConcernRequest req = new CreateConcernRequest();
        req.setCustomerName("Priya");
        req.setCustomerEmail("bad-email");
        req.setCategory("Booking");
        req.setSubject("");
        req.setMessage("");

        var violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("Valid email is required")));
    }
}
