declare module 'tz-lookup' {
  /** Returns the IANA timezone name for a latitude/longitude pair. */
  export default function tzlookup(latitude: number, longitude: number): string;
}

declare module 'zipcodes' {
  export interface ZipResult {
    zip: string;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    country: string;
  }
  export function lookup(zip: string | number): ZipResult | undefined;
}
