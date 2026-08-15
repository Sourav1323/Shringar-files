package com.shringar.repository;

import com.shringar.model.SiteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteSettingsRepository extends JpaRepository<SiteSettings, Long> {
    // single-row table — service layer always fetches id=1 (or first available)
}
