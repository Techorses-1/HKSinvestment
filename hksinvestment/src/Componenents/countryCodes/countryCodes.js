// src/utils/countryCodes.js

export const countryCodes = [
    // North America
    { code: "+1", name: "United States", flag: "🇺🇸" },
    { code: "+1", name: "Canada", flag: "🇨🇦" },
    { code: "+52", name: "Mexico", flag: "🇲🇽" },

    // Europe
    { code: "+44", name: "United Kingdom", flag: "🇬🇧" },
    { code: "+49", name: "Germany", flag: "🇩🇪" },
    { code: "+33", name: "France", flag: "🇫🇷" },
    { code: "+39", name: "Italy", flag: "🇮🇹" },
    { code: "+34", name: "Spain", flag: "🇪🇸" },
    { code: "+31", name: "Netherlands", flag: "🇳🇱" },
    { code: "+32", name: "Belgium", flag: "🇧🇪" },
    { code: "+41", name: "Switzerland", flag: "🇨🇭" },
    { code: "+46", name: "Sweden", flag: "🇸🇪" },
    { code: "+47", name: "Norway", flag: "🇳🇴" },
    { code: "+45", name: "Denmark", flag: "🇩🇰" },
    { code: "+358", name: "Finland", flag: "🇫🇮" },
    { code: "+353", name: "Ireland", flag: "🇮🇪" },
    { code: "+351", name: "Portugal", flag: "🇵🇹" },
    { code: "+30", name: "Greece", flag: "🇬🇷" },
    { code: "+36", name: "Hungary", flag: "🇭🇺" },
    { code: "+420", name: "Czech Republic", flag: "🇨🇿" },
    { code: "+48", name: "Poland", flag: "🇵🇱" },
    { code: "+43", name: "Austria", flag: "🇦🇹" },
    { code: "+40", name: "Romania", flag: "🇷🇴" },
    { code: "+380", name: "Ukraine", flag: "🇺🇦" },
    { code: "+7", name: "Russia", flag: "🇷🇺" },

    // Asia
    { code: "+91", name: "India", flag: "🇮🇳" },
    { code: "+86", name: "China", flag: "🇨🇳" },
    { code: "+81", name: "Japan", flag: "🇯🇵" },
    { code: "+82", name: "South Korea", flag: "🇰🇷" },
    { code: "+65", name: "Singapore", flag: "🇸🇬" },
    { code: "+60", name: "Malaysia", flag: "🇲🇾" },
    { code: "+62", name: "Indonesia", flag: "🇮🇩" },
    { code: "+63", name: "Philippines", flag: "🇵🇭" },
    { code: "+66", name: "Thailand", flag: "🇹🇭" },
    { code: "+84", name: "Vietnam", flag: "🇻🇳" },
    { code: "+92", name: "Pakistan", flag: "🇵🇰" },
    { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
    { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
    { code: "+977", name: "Nepal", flag: "🇳🇵" },
    { code: "+971", name: "UAE", flag: "🇦🇪" },
    { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "+964", name: "Iraq", flag: "🇮🇶" },
    { code: "+98", name: "Iran", flag: "🇮🇷" },
    { code: "+90", name: "Turkey", flag: "🇹🇷" },

    // Africa
    { code: "+27", name: "South Africa", flag: "🇿🇦" },
    { code: "+234", name: "Nigeria", flag: "🇳🇬" },
    { code: "+254", name: "Kenya", flag: "🇰🇪" },
    { code: "+20", name: "Egypt", flag: "🇪🇬" },
    { code: "+212", name: "Morocco", flag: "🇲🇦" },
    { code: "+233", name: "Ghana", flag: "🇬🇭" },
    { code: "+256", name: "Uganda", flag: "🇺🇬" },
    { code: "+255", name: "Tanzania", flag: "🇹🇿" },
    { code: "+258", name: "Mozambique", flag: "🇲🇿" },
    { code: "+263", name: "Zimbabwe", flag: "🇿🇼" },

    // Oceania
    { code: "+61", name: "Australia", flag: "🇦🇺" },
    { code: "+64", name: "New Zealand", flag: "🇳🇿" },
    { code: "+679", name: "Fiji", flag: "🇫🇯" },
    { code: "+675", name: "Papua New Guinea", flag: "🇵🇬" },

    // South America
    { code: "+55", name: "Brazil", flag: "🇧🇷" },
    { code: "+54", name: "Argentina", flag: "🇦🇷" },
    { code: "+57", name: "Colombia", flag: "🇨🇴" },
    { code: "+56", name: "Chile", flag: "🇨🇱" },
    { code: "+51", name: "Peru", flag: "🇵🇪" },
    { code: "+58", name: "Venezuela", flag: "🇻🇪" },
    { code: "+593", name: "Ecuador", flag: "🇪🇨" },
    { code: "+591", name: "Bolivia", flag: "🇧🇴" },
    { code: "+595", name: "Paraguay", flag: "🇵🇾" },
    { code: "+598", name: "Uruguay", flag: "🇺🇾" },

    // Caribbean
    { code: "+53", name: "Cuba", flag: "🇨🇺" },
    { code: "+809", name: "Dominican Republic", flag: "🇩🇴" },
    { code: "+876", name: "Jamaica", flag: "🇯🇲" },

];

// Get default country (US)
export const defaultCountry = countryCodes[0];

// Get country by code
export const getCountryByCode = (code) => {
    return countryCodes.find(country => country.code === code) || defaultCountry;
};

// Get unique country codes (for dropdown)
export const getUniqueCountryCodes = () => {
    const unique = [];
    const seen = new Set();
    for (const country of countryCodes) {
        if (!seen.has(country.code)) {
            seen.add(country.code);
            unique.push(country);
        }
    }
    return unique;
};