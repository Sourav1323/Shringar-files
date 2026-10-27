/**
 * Algorithmic Artist Minimization & Dedicated Design Expert Dispatcher
 *
 * Rules:
 * 1. Each master artist can execute up to 3 designs per session (K <= 3 -> 1 artist; K in [4,6] -> 2 artists; K in [7,9] -> 3 artists).
 * 2. Minimizes the total number of artists required to visit for an order to ceil(K / 3).
 * 3. Assigns designs to their dedicated style expert in the customer's selected city.
 * 4. Recommends complementary designs that share the same visiting artist so the customer can maximize their session without incurring extra artist visits.
 */

import { CITY_ARTIST_DATABASE, getArtistsForCity } from './cityUtils';

export const MAX_DESIGNS_PER_ARTIST = 3;

// Fallback universal artist if city has no specific artist profile
const DEFAULT_FALLBACK_ARTIST = {
  id: 101,
  name: 'Kavita Sharma',
  role: 'Royal Dulhan & Traditional Bridal Specialist',
  rating: 4.95,
  expYears: 10,
  categories: ['Bridal', 'Traditional', 'Mughal', 'Arabic', 'Minimal'],
  primaryDesignIds: [1, 4, 6],
};

/**
 * Calculates compatibility score between a design and an artist
 */
function calculateDesignArtistScore(design, artist) {
  if (!design || !artist) return 0;
  let score = 10; // Baseline capable

  const designId = Number(design.id) || 0;
  const designCat = (design.category || '').toLowerCase();
  const designName = (design.name || '').toLowerCase();
  const designDesc = (design.description || '').toLowerCase();

  // Primary design author / dedicated expert match
  if (artist.primaryDesignIds && artist.primaryDesignIds.includes(designId)) {
    score += 100;
  }

  // Category specialization match
  if (artist.categories && Array.isArray(artist.categories)) {
    const matchedCat = artist.categories.some((c) =>
      designCat.includes(c.toLowerCase()) || c.toLowerCase().includes(designCat)
    );
    if (matchedCat) score += 40;
  }

  // Role keyword match
  const role = (artist.role || '').toLowerCase();
  if (role.includes('bridal') && (designCat.includes('bridal') || designName.includes('bridal'))) {
    score += 30;
  }
  if (role.includes('arabic') && (designCat.includes('arabic') || designName.includes('arabic'))) {
    score += 30;
  }
  if (role.includes('minimal') && (designCat.includes('minimal') || designName.includes('minimal'))) {
    score += 30;
  }
  if (role.includes('mughal') && (designCat.includes('mughal') || designName.includes('mughal'))) {
    score += 30;
  }
  if (role.includes('jaal') && (designDesc.includes('jaal') || designName.includes('jaal'))) {
    score += 20;
  }

  // Experience and rating weighting
  score += (Number(artist.rating) || 4.8) * 5;
  score += (Number(artist.expYears) || 5) * 0.5;

  return score;
}

/**
 * Optimizes artist assignment for a given set of designs in a target city.
 * Minimizes the number of artists to ceil(K / 3).
 *
 * @param {Array} selectedDesigns - Array of design objects from cart or order
 * @param {string} targetCity - The celebration city
 * @returns {Object} Optimized assignment manifest
 */
export function optimizeArtistAssignment(selectedDesigns = [], targetCity = 'Delhi NCR') {
  const designs = Array.isArray(selectedDesigns) ? selectedDesigns.filter(Boolean) : [];
  const k = designs.length;

  if (k === 0) {
    return {
      totalDesigns: 0,
      artistCount: 0,
      isOptimalMinimum: true,
      optimalMinimumCount: 0,
      assignedArtists: [],
      summaryText: 'No designs selected',
      adviceText: 'Add designs to calculate minimal artist dispatch.',
    };
  }

  const artistsInCity = getArtistsForCity(targetCity);
  const candidateArtists = artistsInCity && artistsInCity.length > 0 
    ? artistsInCity 
    : [DEFAULT_FALLBACK_ARTIST];

  // Target minimal number of artists: ceil(K / 3)
  const targetArtistCount = Math.max(1, Math.ceil(k / MAX_DESIGNS_PER_ARTIST));

  // If order has 1 to 3 designs, find the BEST single artist who can fulfill ALL designs
  if (k <= MAX_DESIGNS_PER_ARTIST) {
    let bestArtist = candidateArtists[0];
    let highestScore = -1;

    for (const artist of candidateArtists) {
      let totalArtistScore = 0;
      for (const d of designs) {
        totalArtistScore += calculateDesignArtistScore(d, artist);
      }
      if (totalArtistScore > highestScore) {
        highestScore = totalArtistScore;
        bestArtist = artist;
      }
    }

    const assigned = [
      {
        artistId: bestArtist.id,
        artistName: bestArtist.name,
        role: bestArtist.role,
        rating: bestArtist.rating || 4.9,
        expYears: bestArtist.expYears || 8,
        city: targetCity,
        designsAssigned: designs,
        assignedCount: k,
        maxCapacity: MAX_DESIGNS_PER_ARTIST,
        capacityRemaining: MAX_DESIGNS_PER_ARTIST - k,
        isLeadArtist: true,
        dispatchStatus: 'Verified & Reserved',
      },
    ];

    const capacityLeft = MAX_DESIGNS_PER_ARTIST - k;
    let advice = 'Optimal 1-Artist Visit achieved! 1 master artist covers this entire session.';
    if (capacityLeft > 0) {
      advice = `1 Visiting Master Artist covers this session. You can add up to ${capacityLeft} more matching design${capacityLeft > 1 ? 's' : ''} with ZERO extra artist visit fee!`;
    }

    return {
      totalDesigns: k,
      artistCount: 1,
      isOptimalMinimum: true,
      optimalMinimumCount: 1,
      assignedArtists: assigned,
      summaryText: `1 Master Artist (${bestArtist.name}) covers all ${k} design${k > 1 ? 's' : ''}.`,
      adviceText: advice,
    };
  }

  // If order has > 3 designs (e.g. 4-6 designs -> 2 artists; 7-9 designs -> 3 artists):
  // We solve a greedy set-packing problem where each artist receives at most 3 designs.
  // We sort designs by complexity (duration / cones) so the primary lead artist takes the most intricate designs (e.g. bridal full hand).
  const sortedDesigns = [...designs].sort((a, b) => {
    const durA = (a.durationMaxHours || a.durationMinHours || 2);
    const durB = (b.durationMaxHours || b.durationMinHours || 2);
    return durB - durA; // Descending
  });

  // Select the top N unique artists from candidate pool (cyclically expanding if city has fewer artists than N)
  const assigned = [];
  const selectedArtists = [];
  for (let i = 0; i < targetArtistCount; i++) {
    const artist = candidateArtists[i % candidateArtists.length];
    // If wrapping around, create an associate dispatch instance
    const instanceId = i < candidateArtists.length ? artist.id : Number(`${artist.id}0${i}`);
    const instanceName = i < candidateArtists.length 
      ? artist.name 
      : `${artist.name} (Associate Team ${i + 1})`;

    selectedArtists.push({
      ...artist,
      id: instanceId,
      name: instanceName,
      isLeadArtist: i === 0,
      designsAssigned: [],
    });
  }

  // Assign each design to the artist with the highest compatibility who has remaining capacity (< 3)
  for (const d of sortedDesigns) {
    let bestArtistIndex = -1;
    let bestScore = -Infinity;

    for (let i = 0; i < selectedArtists.length; i++) {
      const art = selectedArtists[i];
      if (art.designsAssigned.length < MAX_DESIGNS_PER_ARTIST) {
        const score = calculateDesignArtistScore(d, art) + (art.isLeadArtist ? 10 : 0);
        if (score > bestScore) {
          bestScore = score;
          bestArtistIndex = i;
        }
      }
    }

    if (bestArtistIndex !== -1) {
      selectedArtists[bestArtistIndex].designsAssigned.push(d);
    } else {
      // Fallback: assign to the one with lowest load
      selectedArtists.sort((a, b) => a.designsAssigned.length - b.designsAssigned.length);
      selectedArtists[0].designsAssigned.push(d);
    }
  }

  const resultArtists = selectedArtists.map((art) => ({
    artistId: art.id,
    artistName: art.name,
    role: art.role,
    rating: art.rating || 4.9,
    expYears: art.expYears || 8,
    city: targetCity,
    designsAssigned: art.designsAssigned,
    assignedCount: art.designsAssigned.length,
    maxCapacity: MAX_DESIGNS_PER_ARTIST,
    capacityRemaining: Math.max(0, MAX_DESIGNS_PER_ARTIST - art.designsAssigned.length),
    isLeadArtist: art.isLeadArtist,
    dispatchStatus: 'Verified & Reserved',
  }));

  const totalCapacity = targetArtistCount * MAX_DESIGNS_PER_ARTIST;
  const remainingTotalSlots = totalCapacity - k;

  return {
    totalDesigns: k,
    artistCount: resultArtists.length,
    isOptimalMinimum: resultArtists.length === targetArtistCount,
    optimalMinimumCount: targetArtistCount,
    assignedArtists: resultArtists,
    summaryText: `Optimized ${resultArtists.length}-Artist Team assigned for ${k} designs (up to 3 per artist).`,
    adviceText: remainingTotalSlots > 0 
      ? `This ${resultArtists.length}-artist team can accommodate ${remainingTotalSlots} more design${remainingTotalSlots > 1 ? 's' : ''} during the same visit without adding another artist.`
      : `All ${resultArtists.length} artists are at optimal capacity (3 designs each).`,
  };
}

/**
 * Recommends complementary designs that match the current visiting artist(s)
 * to minimize the number of visiting artists.
 *
 * @param {Array} currentCartItems - Array of design objects currently in cart
 * @param {Array} allCatalogDesigns - All available catalog designs
 * @param {string} targetCity - Active celebration city
 * @param {number} limit - Max recommendations to return
 * @returns {Array} Recommended designs sorted by artist compatibility
 */
export function getRecommendedDesignsForMinimalArtists(
  currentCartItems = [],
  allCatalogDesigns = [],
  targetCity = 'Delhi NCR',
  limit = 4
) {
  if (!Array.isArray(allCatalogDesigns) || allCatalogDesigns.length === 0) {
    return [];
  }

  const cart = Array.isArray(currentCartItems) ? currentCartItems.filter(Boolean) : [];
  const cartIds = new Set(cart.map((item) => String(item.id)));
  const candidates = allCatalogDesigns.filter((d) => !cartIds.has(String(d.id)));

  if (candidates.length === 0) return [];

  // If cart is empty, return popular / featured designs
  if (cart.length === 0) {
    return candidates.slice(0, limit);
  }

  // Get currently assigned artist(s) for the cart
  const currentManifest = optimizeArtistAssignment(cart, targetCity);
  const primaryAssignedArtist = currentManifest.assignedArtists[0];

  if (!primaryAssignedArtist) {
    return candidates.slice(0, limit);
  }

  // Score candidates based on how well they match the already-assigned artist(s)
  const scored = candidates.map((design) => {
    let matchScore = 0;

    // Check match with all currently assigned artists
    for (const assignedArt of currentManifest.assignedArtists) {
      const artScore = calculateDesignArtistScore(design, assignedArt);
      if (artScore > matchScore) {
        matchScore = artScore;
      }
    }

    // Boost designs that are primary creations of the current artist
    if (primaryAssignedArtist.primaryDesignIds?.includes(Number(design.id))) {
      matchScore += 80;
    }

    return {
      design,
      matchScore,
      visitingArtistName: primaryAssignedArtist.artistName,
      isSingleArtistMatch: true,
      remainingCapacity: primaryAssignedArtist.capacityRemaining,
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit).map((s) => s.design);
}

/**
 * Checks if a candidate design can be executed by the current visiting artist in the cart.
 */
export function getArtistCompatibility(candidateDesign, cartItems = [], targetCity = 'Delhi NCR') {
  if (!candidateDesign || !cartItems || cartItems.length === 0) {
    return {
      isMatch: false,
      label: null,
      artistName: null,
    };
  }

  const manifest = optimizeArtistAssignment(cartItems, targetCity);
  const lead = manifest.assignedArtists[0];

  if (!lead) {
    return { isMatch: false, label: null, artistName: null };
  }

  const score = calculateDesignArtistScore(candidateDesign, lead);
  const isMatch = score >= 40;

  return {
    isMatch,
    artistName: lead.artistName,
    capacityRemaining: lead.capacityRemaining,
    label: isMatch && lead.capacityRemaining > 0
      ? `✨ 1-Artist Visit Match with ${lead.artistName.split(' ')[0]}`
      : null,
  };
}
