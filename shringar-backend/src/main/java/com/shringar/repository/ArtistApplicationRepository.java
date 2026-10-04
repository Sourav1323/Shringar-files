package com.shringar.repository;

import com.shringar.model.ArtistApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtistApplicationRepository extends JpaRepository<ArtistApplication, Long> {
    List<ArtistApplication> findAllByOrderByCreatedAtDesc();
    List<ArtistApplication> findByStatusOrderByCreatedAtDesc(String status);
}
