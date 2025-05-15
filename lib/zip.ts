// lib/zip.ts
import zipcodes from 'zipcodes';

export function lookupZip(zip: string) {
  // returns { zip, city, state, latitude, longitude } or null
  return zipcodes.lookup(zip);
}
