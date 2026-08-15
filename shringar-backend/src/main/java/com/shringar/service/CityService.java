package com.shringar.service;

import com.shringar.dto.response.CityResponse;
import com.shringar.exception.ResourceNotFoundException;
import com.shringar.model.Area;
import com.shringar.model.City;
import com.shringar.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;

    public List<CityResponse> getAllCities() {
        return cityRepository.findAllByOrderByIsActiveDescNameAsc()
                .stream().map(this::toResponse).toList();
    }

    public CityResponse getCityByName(String name) {
        City city = cityRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> new ResourceNotFoundException("City not found: " + name));
        return toResponse(city);
    }

    public List<CityResponse> getActiveCities() {
        return cityRepository.findByIsActiveTrue()
                .stream().map(this::toResponse).toList();
    }

    private CityResponse toResponse(City city) {
        return CityResponse.builder()
                .id(city.getId())
                .name(city.getName())
                .displayName(city.getDisplayName())
                .isActive(city.getIsActive())
                .isComingSoon(city.getIsComingSoon())
                .artistCount(city.getArtistCount())
                .launchQuarter(city.getLaunchQuarter())
                .areas(city.getAreas().stream().map(Area::getName).toList())
                .build();
    }
}
