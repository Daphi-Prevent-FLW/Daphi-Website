// The promised intent journeys (master prompt 8.2, 10.1, 11.1). check-links.mjs fails if a page no longer
// contains the link. `{lang}` is expanded for every language. Add a line when you add a journey.
export const JOURNEYS = [
  { label: 'Home tile: reduce food waste', from: '/{lang}/', href: '/{lang}/flw-prevention/' },
  { label: 'Home tile: new business opportunities', from: '/{lang}/', href: '/{lang}/partnerships/#working-with-daphi' },
  { label: 'Home tile: granular FLW data for research', from: '/{lang}/', href: '/{lang}/data/' },
  { label: 'Partnerships tile: acquire more clients', from: '/{lang}/partnerships/', href: '/{lang}/partnerships/#working-with-daphi' },
  { label: 'Partnerships tile: monetize my granular FLW data', from: '/{lang}/partnerships/', href: '/{lang}/data/#share-data' },
  { label: 'Partnerships: data collaboration pointer', from: '/{lang}/partnerships/', href: '/{lang}/data/#share-data' },
  { label: 'Data page: jump to explore', from: '/{lang}/data/', href: '#explore-data' },
  { label: 'Data page: jump to measurement', from: '/{lang}/data/', href: '#request-measurement' },
  { label: 'Data page: jump to share', from: '/{lang}/data/', href: '#share-data' },
];
