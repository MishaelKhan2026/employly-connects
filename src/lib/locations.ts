/** Country → City → Street options used by the onboarding location pickers. */
export const LOCATIONS: Record<string, Record<string, string[]>> = {
  "Saudi Arabia": {
    Riyadh: ["Olaya District", "Rose Garden Ave.", "Hillside Souvenir District", "Al Malaz"],
    Jeddah: ["Corniche Road", "Al Balad Old Town", "Rose Garden Ave."],
  },
  Iraq: {
    Sulaymaniyah: ["Sulaimaniyah", "Salim Street", "Hillside Souvenir District"],
    Erbil: ["Ainkawa", "Citadel Road", "Rose Garden Ave."],
  },
  "United Kingdom": {
    London: ["Camden High Street", "Brick Lane", "Portobello Road"],
    Manchester: ["Deansgate", "Oldham Road", "Wilmslow Road"],
  },
};

export const COUNTRIES = Object.keys(LOCATIONS);

export const citiesOf = (country: string) => Object.keys(LOCATIONS[country] ?? {});

export const streetsOf = (country: string, city: string) => LOCATIONS[country]?.[city] ?? [];

/** Best-effort mapping of a free-text area/street onto the dropdown options. */
export function inferGeo(street: string): { country: string; city: string; street: string } {
  const needle = street.trim().toLowerCase();
  for (const country of COUNTRIES) {
    for (const city of citiesOf(country)) {
      for (const s of streetsOf(country, city)) {
        if (s.toLowerCase() === needle) return { country, city, street: s };
      }
      if (city.toLowerCase() === needle) return { country, city, street: street.trim() };
    }
  }
  return { country: "", city: "", street: street.trim() };
}
