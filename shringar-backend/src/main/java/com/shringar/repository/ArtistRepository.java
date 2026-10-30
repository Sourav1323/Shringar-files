package com.shringar.repository;

import com.shringar.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

import java.util.Optional;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
    List<Artist> findByCityAndIsActiveTrue(String city);
    List<Artist> findByCityIgnoreCaseAndIsActiveTrue(String city);

    @Query("SELECT a FROM Artist a WHERE (LOWER(a.city) = LOWER(:city) OR LOWER(:city) LIKE CONCAT('%', LOWER(a.city), '%') OR LOWER(a.city) LIKE CONCAT('%', LOWER(:city), '%')) AND a.isActive = true AND (a.isAvailable IS NULL OR a.isAvailable = true)")
    List<Artist> findByCityFlexible(@Param("city") String city);

    List<Artist> findByCityAndServiceAreasContainingAndIsActiveTrue(String city, String area);
    List<Artist> findAllByOrderByNameAsc();   // admin: see every artist incl. inactive

    boolean existsByNameIgnoreCase(String name);
    boolean existsByEmailIgnoreCase(String email);
    Optional<Artist> findByUserId(Long userId);
    Optional<Artist> findByEmailIgnoreCase(String email);
}
