/**
 * Pincode Distance & Threshold Pricing Utility for Shringar Mehendi
 *
 * Requirements:
 * - Checks distance between user-entered area pincode and selected artist's base/home pincode.
 * - Distance <= 10 km: Standard doorstep booking (no extra distance minimum).
 * - Distance > 10 km: Minimum booking order amount is set to ₹350 for the next 10 km,
 *   and ₹350 for each subsequent 10 km bracket (e.g. 10.1-20km = ₹350, 20.1-30km = ₹700, 30.1-40km = ₹1050).
 */

// Coordinates for major Indian Postal 3-digit prefixes & city hubs
const PINCODE_COORDINATES = {
  // Delhi NCR
  '110': { lat: 28.6139, lng: 77.2090, city: 'Delhi NCR' },
  '121': { lat: 28.4089, lng: 77.3178, city: 'Delhi NCR (Faridabad)' },
  '122': { lat: 28.4595, lng: 77.0266, city: 'Delhi NCR (Gurgaon)' },
  '201': { lat: 28.5355, lng: 77.3910, city: 'Delhi NCR (Noida/Ghaziabad)' },
  
  // Mumbai & MMR
  '400': { lat: 19.0760, lng: 72.8777, city: 'Mumbai' },
  '401': { lat: 19.2183, lng: 72.9781, city: 'Mumbai (Thane/Navi Mumbai)' },
  '410': { lat: 18.7500, lng: 73.4000, city: 'MMR (Lonavala/Khopoli)' },

  // Pune
  '411': { lat: 18.5204, lng: 73.8567, city: 'Pune' },
  '412': { lat: 18.6000, lng: 73.9500, city: 'Pune Rural' },

  // Bangalore
  '560': { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
  '562': { lat: 13.1500, lng: 77.5000, city: 'Bangalore Rural' },

  // Jaipur & Ajmer
  '302': { lat: 26.9124, lng: 75.7873, city: 'Jaipur' },
  '303': { lat: 26.9800, lng: 75.9000, city: 'Jaipur Outer' },
  '305': { lat: 26.4499, lng: 74.6399, city: 'Ajmer' },

  // Hyderabad
  '500': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad' },
  '501': { lat: 17.4500, lng: 78.6000, city: 'Hyderabad Outer' },

  // Kolkata
  '700': { lat: 22.5726, lng: 88.3639, city: 'Kolkata' },
  '711': { lat: 22.5958, lng: 88.2636, city: 'Howrah' },

  // Ahmedabad
  '380': { lat: 23.0225, lng: 72.5714, city: 'Ahmedabad' },
  '382': { lat: 23.2156, lng: 72.6369, city: 'Gandhinagar' },
};

// Default Home/Base Pincodes for Artists per City
export const ARTIST_HOME_PINCODES = {
  // Database IDs (1-13)
  1: { name: 'Sunita Verma', pincode: '400050', area: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  2: { name: 'Rekha Patel', pincode: '400058', area: 'Andheri West, Mumbai', lat: 19.1197, lng: 72.8464 },
  3: { name: 'Fatima Khan', pincode: '400005', area: 'Colaba, South Mumbai', lat: 18.9067, lng: 72.8147 },
  4: { name: 'Preethi Nair', pincode: '411001', area: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940 },
  5: { name: 'Deepa Kulkarni', pincode: '411038', area: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },
  6: { name: 'Asha Desai', pincode: '422001', area: 'Nashik Central', lat: 19.9975, lng: 73.7898 },
  7: { name: 'Kavita Sharma', pincode: '110001', area: 'Connaught Place, Central Delhi', lat: 28.6304, lng: 77.2177 },
  8: { name: 'Pooja Mehra', pincode: '110017', area: 'Saket, South Delhi', lat: 28.5244, lng: 77.2066 },
  9: { name: 'Divya Hegde', pincode: '560038', area: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
  10: { name: 'Meera Krishnan', pincode: '560011', area: 'Jayanagar, Bangalore', lat: 12.9308, lng: 77.5838 },
  11: { name: 'Manju Shekhawat', pincode: '302001', area: 'MI Road / C-Scheme, Jaipur', lat: 26.9157, lng: 75.8118 },
  12: { name: 'Urmila Rathore', pincode: '302020', area: 'Mansarovar, Jaipur', lat: 26.8647, lng: 75.7686 },
  13: { name: 'Zoya Siddiqui', pincode: '500034', area: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4354 },

  // Delhi NCR
  101: { name: 'Kavita Sharma', pincode: '110001', area: 'Connaught Place, Central Delhi', lat: 28.6304, lng: 77.2177 },
  102: { name: 'Pooja Mehra', pincode: '110017', area: 'Saket, South Delhi', lat: 28.5244, lng: 77.2066 },
  1001: { name: 'Pooja Verma', pincode: '110027', area: 'Rajouri Garden, West Delhi', lat: 28.6473, lng: 77.1219 },

  // Mumbai
  103: { name: 'Sunita Verma', pincode: '400050', area: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  104: { name: 'Rekha Patel', pincode: '400058', area: 'Andheri West, Mumbai', lat: 19.1197, lng: 72.8464 },
  105: { name: 'Fatima Khan', pincode: '400005', area: 'Colaba, South Mumbai', lat: 18.9067, lng: 72.8147 },

  // Jaipur
  106: { name: 'Manju Shekhawat', pincode: '302001', area: 'MI Road / C-Scheme, Jaipur', lat: 26.9157, lng: 75.8118 },
  107: { name: 'Urmila Rathore', pincode: '302020', area: 'Mansarovar, Jaipur', lat: 26.8647, lng: 75.7686 },
  1003: { name: 'Ritu Mehendi Artist', pincode: '302021', area: 'Vaishali Nagar, Jaipur', lat: 26.9124, lng: 75.7433 },

  // Bangalore
  108: { name: 'Divya Hegde', pincode: '560038', area: 'Indiranagar, Bangalore', lat: 12.9784, lng: 77.6408 },
  114: { name: 'Shreya Gowda', pincode: '560011', area: 'Jayanagar, Bangalore', lat: 12.9308, lng: 77.5838 },

  // Hyderabad
  111: { name: 'Zoya Siddiqui', pincode: '500034', area: 'Banjara Hills, Hyderabad', lat: 17.4156, lng: 78.4354 },
  115: { name: 'Farzana Begum', pincode: '500002', area: 'Charminar, Hyderabad', lat: 17.3616, lng: 78.4747 },

  // Kolkata
  116: { name: 'Debolina Das', pincode: '700016', area: 'Park Street, Kolkata', lat: 22.5510, lng: 88.3533 },

  // Pune
  109: { name: 'Preethi Nair', pincode: '411001', area: 'Koregaon Park, Pune', lat: 18.5362, lng: 73.8940 },
  110: { name: 'Deepa Kulkarni', pincode: '411038', area: 'Kothrud, Pune', lat: 18.5074, lng: 73.8077 },

  // Ahmedabad
  117: { name: 'Hetal Shah', pincode: '380009', area: 'Navrangpura, Ahmedabad', lat: 23.0365, lng: 72.5611 },
};

// Default city center pincodes
export const CITY_DEFAULT_PINCODES = {
  'Delhi NCR': '110001',
  'New Delhi': '110001',
  'Mumbai': '400050',
  'Bangalore': '560001',
  'Bengaluru': '560001',
  'Jaipur': '302001',
  'Ajmer': '305001',
  'Gurugram': '122001',
  'Hyderabad': '500001',
  'Kolkata': '700001',
  'Pune': '411001',
  'Ahmedabad': '380001',
  'Nashik': '422001',
  'Udaipur': '313001',
  'Jodhpur': '342001',
  'Lucknow': '226001',
  'Chandigarh': '160017',
  'Chennai': '600001',
};

/**
 * Validates if a string is a valid 6-digit Indian PIN code.
 */
export function isValidIndianPincode(pin) {
  if (!pin) return false;
  const clean = String(pin).trim();
  return /^[1-9][0-9]{5}$/.test(clean);
}

/**
 * Calculates Haversine distance in kilometers between two lat/lng coordinates.
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const aerialKm = R * c;
  // Apply average urban road circuity factor (1.28x)
  return Math.round(aerialKm * 1.28 * 10) / 10;
}

/**
 * Calculates estimated road distance (in km) between user pincode and artist home pincode.
 *
 * @param {string} userPin 6-digit customer venue pincode
 * @param {string|number|object} artistOrPin Artist ID, artist object, or artist 6-digit pincode
 * @param {string} selectedCity Context city name
 * @returns {number} distance in kilometers
 */
export function calculatePincodeDistance(userPin, artistOrPin, selectedCity = 'Delhi NCR') {
  const cleanUserPin = String(userPin || '').trim();
  if (!cleanUserPin || cleanUserPin.length < 6) return 5; // default 5km if pending

  let artistHome = null;
  if (typeof artistOrPin === 'object' && (artistOrPin?.homePincode || artistOrPin?.pincode)) {
    artistHome = { pincode: String(artistOrPin.homePincode || artistOrPin.pincode) };
  } else if (typeof artistOrPin === 'number' || (typeof artistOrPin === 'string' && ARTIST_HOME_PINCODES[artistOrPin])) {
    artistHome = ARTIST_HOME_PINCODES[artistOrPin];
  } else if (typeof artistOrPin === 'string' && isValidIndianPincode(artistOrPin)) {
    artistHome = { pincode: artistOrPin };
  }

  // Fallback artist pincode by city if none provided
  const artistPin = artistHome?.pincode || CITY_DEFAULT_PINCODES[selectedCity] || '110001';

  if (cleanUserPin === artistPin) {
    return 2.5; // same exact postal beat / neighborhood
  }

  // Check if we have exact lat/long for artist
  const artistLat = artistHome?.lat;
  const artistLng = artistHome?.lng;

  const userPrefix = cleanUserPin.slice(0, 3);
  const artistPrefix = artistPin.slice(0, 3);

  const userCoord = PINCODE_COORDINATES[userPrefix];
  const artistCoord = (artistLat && artistLng) ? { lat: artistLat, lng: artistLng } : PINCODE_COORDINATES[artistPrefix];

  if (userCoord && artistCoord) {
    // If same 3-digit district prefix (e.g. 110001 vs 110027)
    if (userPrefix === artistPrefix) {
      const pinDiff = Math.abs(Number(cleanUserPin) - Number(artistPin));
      const heuristicDist = Math.max(3, Math.min(28, Math.round(pinDiff * 0.45 * 10) / 10));
      return heuristicDist;
    }
    const dist = haversineDistanceKm(userCoord.lat, userCoord.lng, artistCoord.lat, artistCoord.lng);
    return Math.max(3, dist);
  }

  // Fallback heuristic based on pincode numeric differences
  if (userPrefix === artistPrefix) {
    const diff = Math.abs(Number(cleanUserPin) - Number(artistPin));
    return Math.max(3, Math.min(25, Math.round(diff * 0.45)));
  }

  const regionUser = cleanUserPin.slice(0, 2);
  const regionArtist = artistPin.slice(0, 2);
  if (regionUser === regionArtist) {
    return 18.5; // same metro zone (e.g. Gurgaon vs Delhi, or Thane vs Mumbai)
  }

  return 32.0; // adjacent districts
}

/**
 * Computes minimum booking amount and distance travel fees based on distance:
 * - If distance <= 10 km: minimum order = 0 (standard booking)
 * - If distance > 10 km: minimum order amount = ₹350 for each 10 km bracket beyond 10 km.
 *   (e.g., 10.1 - 20 km = ₹350; 20.1 - 30 km = ₹700; 30.1 - 40 km = ₹1050; etc.)
 *
 * @param {number} distanceKm Distance in kilometers
 * @returns {object} { distanceKm, isBeyond10Km, extraKm, brackets, minOrderAmount, isThresholdSatisfied }
 */
export function calculateDistancePricing(distanceKm, currentTotal = 0) {
  const dist = Math.max(1, Math.round((Number(distanceKm) || 1) * 10) / 10);

  if (dist <= 10) {
    return {
      distanceKm: dist,
      isBeyond10Km: false,
      extraKm: 0,
      brackets: 0,
      minOrderAmount: 0,
      isThresholdSatisfied: true,
      bracketLabel: 'Within Standard 10 km Zone',
      message: `Within local 10 km service radius (${dist} km). Standard booking pricing applies.`,
    };
  }

  const extraKm = Math.round((dist - 10) * 10) / 10;
  const brackets = Math.ceil(extraKm / 10);
  const minOrderAmount = brackets * 350;
  const isThresholdSatisfied = (Number(currentTotal) || 0) >= minOrderAmount;

  return {
    distanceKm: dist,
    isBeyond10Km: true,
    extraKm,
    brackets,
    minOrderAmount,
    isThresholdSatisfied,
    bracketLabel: `${brackets}x 10 km Bracket (${dist} km)`,
    message: `Doorstep travel distance is ${dist} km (>10 km zone). Minimum booking order amount is ₹${minOrderAmount} (₹350 per 10 km bracket beyond 10 km).`,
  };
}
