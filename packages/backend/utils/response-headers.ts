export const defaultResponseHeaders = {
  'Content-Type': 'application/json',
  'Strict-Transport-Security': 'max-age=63072000; includeSubdomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'Access-Control-Allow-Origin': process.env.CORS_ALLOW_ORIGIN || '*'
};
