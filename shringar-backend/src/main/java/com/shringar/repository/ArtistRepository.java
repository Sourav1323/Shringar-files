package com.shringar.repository;

import com.shringar.model.Artist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ArtistRepository extends JpaRepository<Artist, Long> {
    List<Artist> findByCityAndIsActiveTrue(String city);
    List<Artist> findByCityAndServiceAreasContainingAndIsActiveTrue(String city, String area);
    List<Artist> findAllByOrderByNameAsc();   // admin: see every artist incl. inactive
}
