declare global {
  interface Port {
    id: string;
    name: string;
    type: string;
    latitude_deg: number;
    longitude_deg: number;
    elevation_ft: number;
    continent: string;
    iso_country: string;
    iso_region: string;
    municipality: string;
    scheduled_service: string;
    icao_code: string;
    iata_code: string;
    gps_code: string;
    local_code: string;
    home_link: string;
    wikipedia_link: string;
    keywords: string;
  }

  interface PilotProfile {
    address: string;
    name: string;
    licenseNumber: string;
    rating: number;
    totalRides: number;
  }
}

export {}