package com.shringar.repository;

import com.shringar.model.Design;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DesignRepository extends JpaRepository<Design, Long> {
    List<Design> findByIsActiveTrueOrderBySortOrderAsc();
    List<Design> findByIsActiveTrueOrderByClickCountDesc();
    List<Design> findByCategoryAndIsActiveTrue(String category);
    List<Design> findByIsFeaturedTrueAndIsActiveTrue();
    List<Design> findByIdIn(List<Long> ids);
    List<Design> findAllByOrderByCreatedAtDesc();          // admin: see every design incl. inactive
    List<Design> findTop10ByIsActiveTrueOrderByClickCountDesc();  // admin dashboard "most clicked" widget

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Design d SET d.clickCount = d.clickCount + 1 WHERE d.id = :id")
    int incrementClickCount(Long id);
}
