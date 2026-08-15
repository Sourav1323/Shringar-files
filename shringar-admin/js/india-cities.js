/**
 * Shringar — Indian Cities Dataset
 * A curated list of major Indian cities grouped by state/UT, used to power
 * autocomplete suggestions wherever a city needs to be added or selected,
 * restricted specifically to India (no manual free-typing of arbitrary
 * city/state combinations, no risk of typos or non-serviceable regions).
 *
 * Shared between the admin portal (adding new serviceable cities) and,
 * if needed later, any customer-facing city picker.
 */
const INDIA_CITIES = [
  // Maharashtra
  { city: "Mumbai", state: "Maharashtra" }, { city: "Pune", state: "Maharashtra" },
  { city: "Nagpur", state: "Maharashtra" }, { city: "Nashik", state: "Maharashtra" },
  { city: "Thane", state: "Maharashtra" }, { city: "Aurangabad", state: "Maharashtra" },
  { city: "Solapur", state: "Maharashtra" }, { city: "Kolhapur", state: "Maharashtra" },
  { city: "Navi Mumbai", state: "Maharashtra" }, { city: "Amravati", state: "Maharashtra" },

  // Delhi NCR
  { city: "New Delhi", state: "Delhi" }, { city: "Delhi", state: "Delhi" },
  { city: "Gurugram", state: "Haryana" }, { city: "Noida", state: "Uttar Pradesh" },
  { city: "Faridabad", state: "Haryana" }, { city: "Ghaziabad", state: "Uttar Pradesh" },

  // Karnataka
  { city: "Bengaluru", state: "Karnataka" }, { city: "Mysuru", state: "Karnataka" },
  { city: "Mangaluru", state: "Karnataka" }, { city: "Hubballi", state: "Karnataka" },
  { city: "Belagavi", state: "Karnataka" },

  // Tamil Nadu
  { city: "Chennai", state: "Tamil Nadu" }, { city: "Coimbatore", state: "Tamil Nadu" },
  { city: "Madurai", state: "Tamil Nadu" }, { city: "Tiruchirappalli", state: "Tamil Nadu" },
  { city: "Salem", state: "Tamil Nadu" }, { city: "Vellore", state: "Tamil Nadu" },

  // Telangana & Andhra Pradesh
  { city: "Hyderabad", state: "Telangana" }, { city: "Warangal", state: "Telangana" },
  { city: "Visakhapatnam", state: "Andhra Pradesh" }, { city: "Vijayawada", state: "Andhra Pradesh" },
  { city: "Guntur", state: "Andhra Pradesh" }, { city: "Tirupati", state: "Andhra Pradesh" },

  // West Bengal
  { city: "Kolkata", state: "West Bengal" }, { city: "Howrah", state: "West Bengal" },
  { city: "Durgapur", state: "West Bengal" }, { city: "Siliguri", state: "West Bengal" },

  // Gujarat
  { city: "Ahmedabad", state: "Gujarat" }, { city: "Surat", state: "Gujarat" },
  { city: "Vadodara", state: "Gujarat" }, { city: "Rajkot", state: "Gujarat" },
  { city: "Gandhinagar", state: "Gujarat" }, { city: "Bhavnagar", state: "Gujarat" },

  // Rajasthan
  { city: "Jaipur", state: "Rajasthan" }, { city: "Jodhpur", state: "Rajasthan" },
  { city: "Udaipur", state: "Rajasthan" }, { city: "Kota", state: "Rajasthan" },
  { city: "Ajmer", state: "Rajasthan" }, { city: "Bikaner", state: "Rajasthan" },

  // Uttar Pradesh
  { city: "Lucknow", state: "Uttar Pradesh" }, { city: "Kanpur", state: "Uttar Pradesh" },
  { city: "Agra", state: "Uttar Pradesh" }, { city: "Varanasi", state: "Uttar Pradesh" },
  { city: "Meerut", state: "Uttar Pradesh" }, { city: "Allahabad (Prayagraj)", state: "Uttar Pradesh" },
  { city: "Bareilly", state: "Uttar Pradesh" }, { city: "Aligarh", state: "Uttar Pradesh" },

  // Madhya Pradesh
  { city: "Bhopal", state: "Madhya Pradesh" }, { city: "Indore", state: "Madhya Pradesh" },
  { city: "Gwalior", state: "Madhya Pradesh" }, { city: "Jabalpur", state: "Madhya Pradesh" },
  { city: "Ujjain", state: "Madhya Pradesh" },

  // Punjab
  { city: "Chandigarh", state: "Punjab" }, { city: "Ludhiana", state: "Punjab" },
  { city: "Amritsar", state: "Punjab" }, { city: "Jalandhar", state: "Punjab" },
  { city: "Patiala", state: "Punjab" },

  // Haryana
  { city: "Panipat", state: "Haryana" }, { city: "Karnal", state: "Haryana" },
  { city: "Hisar", state: "Haryana" }, { city: "Rohtak", state: "Haryana" },

  // Kerala
  { city: "Kochi", state: "Kerala" }, { city: "Thiruvananthapuram", state: "Kerala" },
  { city: "Kozhikode", state: "Kerala" }, { city: "Thrissur", state: "Kerala" },
  { city: "Kollam", state: "Kerala" },

  // Bihar & Jharkhand
  { city: "Patna", state: "Bihar" }, { city: "Gaya", state: "Bihar" },
  { city: "Muzaffarpur", state: "Bihar" }, { city: "Ranchi", state: "Jharkhand" },
  { city: "Jamshedpur", state: "Jharkhand" }, { city: "Dhanbad", state: "Jharkhand" },

  // Odisha
  { city: "Bhubaneswar", state: "Odisha" }, { city: "Cuttack", state: "Odisha" },
  { city: "Rourkela", state: "Odisha" },

  // Assam & Northeast
  { city: "Guwahati", state: "Assam" }, { city: "Dibrugarh", state: "Assam" },
  { city: "Shillong", state: "Meghalaya" }, { city: "Imphal", state: "Manipur" },
  { city: "Agartala", state: "Tripura" }, { city: "Aizawl", state: "Mizoram" },
  { city: "Kohima", state: "Nagaland" }, { city: "Itanagar", state: "Arunachal Pradesh" },
  { city: "Gangtok", state: "Sikkim" },

  // Uttarakhand
  { city: "Dehradun", state: "Uttarakhand" }, { city: "Haridwar", state: "Uttarakhand" },
  { city: "Rishikesh", state: "Uttarakhand" }, { city: "Nainital", state: "Uttarakhand" },

  // Himachal Pradesh & J&K
  { city: "Shimla", state: "Himachal Pradesh" }, { city: "Manali", state: "Himachal Pradesh" },
  { city: "Srinagar", state: "Jammu and Kashmir" }, { city: "Jammu", state: "Jammu and Kashmir" },
  { city: "Leh", state: "Ladakh" },

  // Chhattisgarh
  { city: "Raipur", state: "Chhattisgarh" }, { city: "Bhilai", state: "Chhattisgarh" },
  { city: "Bilaspur", state: "Chhattisgarh" },

  // Goa
  { city: "Panaji", state: "Goa" }, { city: "Margao", state: "Goa" },

  // Union Territories
  { city: "Puducherry", state: "Puducherry" }, { city: "Port Blair", state: "Andaman and Nicobar Islands" },
  { city: "Silvassa", state: "Dadra and Nagar Haveli and Daman and Diu" },
];

/**
 * Populates a <datalist> element with India-only city suggestions and
 * returns a lookup map so the caller can resolve a chosen city name back
 * to its full { city, state } record for auto-filling other fields.
 *
 * @param {string} datalistId - id of the target <datalist> element
 * @returns {Map<string, {city: string, state: string}>}
 */
function populateIndiaCitiesDatalist(datalistId) {
  const datalist = document.getElementById(datalistId);
  const lookup = new Map();
  if (!datalist) return lookup;

  datalist.innerHTML = INDIA_CITIES.map(entry => {
    const label = `${entry.city}, ${entry.state}`;
    lookup.set(label, entry);
    lookup.set(entry.city, entry); // also allow matching on city name alone
    return `<option value="${label}">`;
  }).join('');

  return lookup;
}
