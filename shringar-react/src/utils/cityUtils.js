/**
 * City & Artist Location Availability Utilities for Shringar
 */

export const CITY_ARTIST_DATABASE = {
  'Delhi NCR': [
    { id: 101, name: 'Kavita Sharma', role: 'Royal Dulhan Specialist', rating: 4.95, expYears: 10, categories: ['Bridal', 'Traditional', 'Mughal'], primaryDesignIds: [1, 4, 6] },
    { id: 102, name: 'Pooja Mehra', role: 'Marwari Jaal & Arabic Master', rating: 4.88, expYears: 8, categories: ['Arabic', 'Minimal', 'Festive'], primaryDesignIds: [2, 3, 7] },
    { id: 1001, name: 'Pooja Verma', role: 'Senior Bridal Artisan', rating: 4.90, expYears: 7, categories: ['Bridal', 'Mughal', 'Arabic'], primaryDesignIds: [5, 8, 9] },
  ],
  'Mumbai': [
    { id: 103, name: 'Sunita Verma', role: 'Rajasthani & Bridal Specialist', rating: 4.92, expYears: 11, categories: ['Bridal', 'Traditional', 'Mughal'], primaryDesignIds: [1, 4, 6] },
    { id: 104, name: 'Rekha Patel', role: 'Arabic & Contemporary Fusion', rating: 4.85, expYears: 6, categories: ['Arabic', 'Minimal', 'Contemporary'], primaryDesignIds: [2, 3, 7] },
    { id: 105, name: 'Fatima Khan', role: 'Mughal & Traditional Heritage', rating: 4.90, expYears: 9, categories: ['Bridal', 'Mughal', 'Arabic'], primaryDesignIds: [5, 8, 9] },
  ],
  'Jaipur': [
    { id: 106, name: 'Manju Shekhawat', role: 'Authentic Marwari Court Bridal', rating: 4.98, expYears: 14, categories: ['Bridal', 'Traditional'], primaryDesignIds: [1, 4, 8] },
    { id: 107, name: 'Urmila Rathore', role: 'Rajasthani Peacock & Feet Specialist', rating: 4.90, expYears: 9, categories: ['Bridal', 'Festive', 'Arabic'], primaryDesignIds: [3, 5, 7] },
    { id: 1003, name: 'Ritu Mehendi Artist', role: 'Royal Heritage Master', rating: 5.0, expYears: 9, categories: ['Bridal', 'Mughal', 'Minimal'], primaryDesignIds: [2, 6, 9] },
  ],
  'Bangalore': [
    { id: 108, name: 'Divya Hegde', role: 'Bridal & South Indian Traditional', rating: 4.92, expYears: 8, categories: ['Bridal', 'Traditional', 'Mughal'], primaryDesignIds: [1, 4, 5] },
    { id: 114, name: 'Shreya Gowda', role: 'Mandala & Minimalist Artist', rating: 4.86, expYears: 5, categories: ['Minimal', 'Arabic', 'Festive'], primaryDesignIds: [2, 3, 7] },
  ],
  'Hyderabad': [
    { id: 111, name: 'Zoya Siddiqui', role: 'Nizami & Mughal Intricate Art', rating: 4.93, expYears: 9, categories: ['Mughal', 'Bridal', 'Traditional'], primaryDesignIds: [1, 4, 6] },
    { id: 115, name: 'Farzana Begum', role: 'Deccani Floral & Bridal Lace', rating: 4.87, expYears: 7, categories: ['Arabic', 'Minimal', 'Festive'], primaryDesignIds: [2, 3, 7] },
  ],
  'Kolkata': [
    { id: 116, name: 'Debolina Das', role: 'Bengali Shankha-Pola & Floral Bridal', rating: 4.89, expYears: 7, categories: ['Bridal', 'Traditional', 'Minimal'], primaryDesignIds: [1, 2, 4] },
  ],
  'Pune': [
    { id: 109, name: 'Preethi Nair', role: 'Minimal & Contemporary Chic', rating: 4.75, expYears: 5, categories: ['Minimal', 'Arabic', 'Contemporary'], primaryDesignIds: [2, 3, 7] },
    { id: 110, name: 'Deepa Kulkarni', role: 'Rajasthani & Festive Jaal', rating: 4.80, expYears: 6, categories: ['Bridal', 'Traditional', 'Mughal'], primaryDesignIds: [1, 4, 5] },
  ],
  'Ahmedabad': [
    { id: 117, name: 'Hetal Shah', role: 'Kundan Mandap & Gujrati Jaal', rating: 4.91, expYears: 8, categories: ['Bridal', 'Traditional', 'Arabic'], primaryDesignIds: [1, 3, 4] },
  ],
};

const DESIGN_CITY_MATRIX = {
  1: { originCity: 'Jaipur', availableCities: ['Jaipur', 'Delhi NCR', 'Mumbai'] },
  2: { originCity: 'Bangalore', availableCities: ['Bangalore', 'Mumbai', 'Pune'] },
  3: { originCity: 'Mumbai', availableCities: ['Mumbai', 'Delhi NCR', 'Hyderabad'] },
  4: { originCity: 'Delhi NCR', availableCities: ['Delhi NCR', 'Jaipur', 'Mumbai'] },
  5: { originCity: 'Jaipur', availableCities: ['Jaipur', 'Bangalore', 'Delhi NCR'] },
  6: { originCity: 'Hyderabad', availableCities: ['Hyderabad', 'Delhi NCR', 'Mumbai'] },
  7: { originCity: 'Delhi NCR', availableCities: ['Delhi NCR', 'Mumbai', 'Kolkata'] },
  8: { originCity: 'Jaipur', availableCities: ['Jaipur', 'Delhi NCR', 'Ahmedabad'] },
  9: { originCity: 'Bangalore', availableCities: ['Bangalore', 'Pune', 'Mumbai'] },
  10: { originCity: 'Hyderabad', availableCities: ['Hyderabad', 'Delhi NCR'] },
  11: { originCity: 'Jaipur', availableCities: ['Jaipur', 'Ahmedabad', 'Delhi NCR'] },
  12: { originCity: 'Pune', availableCities: ['Pune', 'Bangalore', 'Mumbai'] },
};

/**
 * Checks if a design has local artists present in the given city.
 */
export function isDesignAvailableInCity(design, targetCity) {
  if (!targetCity) return true;
  const target = targetCity.toLowerCase().replace(/[^a-z]/g, '');

  // 1. If availableCities is explicitly configured from Admin Portal
  if (Array.isArray(design?.availableCities) && design.availableCities.length > 0) {
    if (design.availableCities.includes('ALL') || design.availableCities.includes('All Cities') || design.availableCities.includes('Nationwide')) {
      return true;
    }
    return design.availableCities.some((c) => {
      const cNorm = c.toLowerCase().replace(/[^a-z]/g, '');
      return cNorm.includes(target) || target.includes(cNorm);
    });
  }

  // 2. Legacy fallback for seed catalog items
  const id = Number(design?.id);
  const mapping = DESIGN_CITY_MATRIX[id];

  if (mapping && mapping.availableCities) {
    return mapping.availableCities.some((c) => {
      const cNorm = c.toLowerCase().replace(/[^a-z]/g, '');
      return cNorm.includes(target) || target.includes(cNorm);
    });
  }

  // 3. New designs created in admin portal without restrictions are available everywhere
  return true;
}

/**
 * Gets origin city for a design.
 */
export function getDesignOriginCity(design) {
  if (design?.originCity) return design.originCity;
  if (Array.isArray(design?.availableCities) && design.availableCities.length > 0) {
    return design.availableCities[0];
  }
  const id = Number(design?.id);
  return DESIGN_CITY_MATRIX[id]?.originCity || 'Artisan Studio';
}

/**
 * Gets local artists available in a given city.
 */
export function getArtistsForCity(targetCity) {
  if (!targetCity) return CITY_ARTIST_DATABASE['Delhi NCR'];
  for (const [cityName, artists] of Object.entries(CITY_ARTIST_DATABASE)) {
    const cNorm = cityName.toLowerCase().replace(/[^a-z]/g, '');
    const tNorm = targetCity.toLowerCase().replace(/[^a-z]/g, '');
    if (cNorm.includes(tNorm) || tNorm.includes(cNorm)) {
      return artists;
    }
  }
  return CITY_ARTIST_DATABASE['Delhi NCR'];
}
