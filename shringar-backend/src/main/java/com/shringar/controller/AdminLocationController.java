package com.shringar.controller;

import com.shringar.dto.response.ApiResponse;
import com.shringar.dto.response.CityAdminResponse;
import com.shringar.exception.BadRequestException;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Area;
import com.shringar.model.City;
import com.shringar.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin/locations")
@RequiredArgsConstructor
public class AdminLocationController {

    private final CityRepository cityRepository;

    @GetMapping("/cities")
    public ApiResponse<List<CityAdminResponse>> getAllCities() {
        return ApiResponse.success(cityRepository.findAll().stream().map(this::toResponse).toList());
    }

    @PostMapping("/cities")
    public ApiResponse<CityAdminResponse> createCity(@RequestBody Map<String, Object> data) {
        String name = ((String) data.get("name")).toLowerCase().trim().replace(" ", "_");
        if (cityRepository.findByNameIgnoreCase(name).isPresent())
            throw new BadRequestException("City '" + name + "' already exists.");
        City city = City.builder()
                .name(name)
                .displayName((String) data.getOrDefault("displayName", name))
                .isActive((Boolean) data.getOrDefault("isActive", true))
                .isComingSoon((Boolean) data.getOrDefault("isComingSoon", false))
                .artistCount(0)
                .launchQuarter((String) data.get("launchQuarter"))
                .build();
        return ApiResponse.success("City created", toResponse(cityRepository.save(city)));
    }

    @PatchMapping("/cities/{id}")
    public ApiResponse<CityAdminResponse> updateCity(@PathVariable Long id, @RequestBody Map<String, Object> data) {
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));
        if (data.containsKey("displayName")) city.setDisplayName((String) data.get("displayName"));
        if (data.containsKey("isActive"))    city.setIsActive((Boolean) data.get("isActive"));
        if (data.containsKey("isComingSoon")) city.setIsComingSoon((Boolean) data.get("isComingSoon"));
        if (data.containsKey("launchQuarter")) city.setLaunchQuarter((String) data.get("launchQuarter"));
        return ApiResponse.success("City updated", toResponse(cityRepository.save(city)));
    }

    @PostMapping("/cities/{cityId}/areas")
    public ApiResponse<CityAdminResponse> addArea(@PathVariable Long cityId, @RequestBody Map<String, Object> data) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));
        String areaName = ((String) data.get("name")).trim();
        boolean exists = city.getAreas().stream().anyMatch(a -> a.getName().equalsIgnoreCase(areaName));
        if (exists) throw new BadRequestException("Area '" + areaName + "' already exists.");
        Area area = Area.builder().name(areaName).city(city).isActive(true).build();
        city.getAreas().add(area);
        return ApiResponse.success("Area added", toResponse(cityRepository.save(city)));
    }

    @DeleteMapping("/cities/{cityId}/areas/{areaName}")
    public ApiResponse<CityAdminResponse> removeArea(@PathVariable Long cityId, @PathVariable String areaName) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));
        city.getAreas().removeIf(a -> a.getName().equalsIgnoreCase(areaName));
        return ApiResponse.success("Area removed", toResponse(cityRepository.save(city)));
    }

    @PatchMapping("/cities/{cityId}/areas/{areaName}/toggle")
    public ApiResponse<CityAdminResponse> toggleArea(@PathVariable Long cityId, @PathVariable String areaName) {
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new ResourceNotFoundException("City not found"));
        city.getAreas().stream()
                .filter(a -> a.getName().equalsIgnoreCase(areaName))
                .findFirst()
                .ifPresent(a -> a.setIsActive(!a.getIsActive()));
        return ApiResponse.success("Area toggled", toResponse(cityRepository.save(city)));
    }

    /**
     * Converts the JPA entity to a flat, safe DTO. Serializing City directly
     * (as this controller used to do) triggers Jackson to walk the bidirectional
     * City <-> Area relationship — city.areas[i].city.areas[i].city... — since
     * neither side has a @JsonIgnore/@JsonBackReference. That produced a garbled,
     * oversized JSON body that failed to parse on the frontend.
     */
    private CityAdminResponse toResponse(City c) {
        return CityAdminResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .displayName(c.getDisplayName())
                .isActive(c.getIsActive())
                .isComingSoon(c.getIsComingSoon())
                .artistCount(c.getArtistCount())
                .launchQuarter(c.getLaunchQuarter())
                .areas(c.getAreas() == null ? List.of() : c.getAreas().stream()
                        .map(a -> CityAdminResponse.AreaAdminResponse.builder()
                                .name(a.getName())
                                .isActive(a.getIsActive())
                                .build())
                        .toList())
                .build();
    }
}
