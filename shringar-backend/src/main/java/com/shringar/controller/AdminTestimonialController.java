package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.model.Testimonial;
import com.shringar.service.AdminTestimonialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AdminTestimonialController {

    private final AdminTestimonialService testimonialService;

    /** Public — used on homepage to render the testimonials section live from DB */
    @GetMapping("/testimonials")
    public ApiResponse<List<Testimonial>> getPublic() {
        return ApiResponse.success(testimonialService.getPublic());
    }

    @GetMapping("/admin/testimonials")
    public ApiResponse<List<Testimonial>> getAll() {
        return ApiResponse.success(testimonialService.getAll());
    }

    @PostMapping("/admin/testimonials")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Testimonial> create(@RequestBody Map<String, Object> data) {
        return ApiResponse.success("Review added", testimonialService.create(data));
    }

    @PatchMapping("/admin/testimonials/{id}")
    public ApiResponse<Testimonial> update(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        return ApiResponse.success("Review updated", testimonialService.update(id, data));
    }

    @DeleteMapping("/admin/testimonials/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        testimonialService.delete(id);
        return ApiResponse.success("Review deleted", null);
    }
}
