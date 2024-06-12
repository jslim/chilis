function encodeBase64(a) {
  var c,
    d,
    e,
    f,
    g,
    h,
    i,
    j,
    o,
    b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    k = 0,
    l = 0,
    m = "",
    n = [];
  if (!a) return a;
  do
    (c = a.charCodeAt(k++)),
      (d = a.charCodeAt(k++)),
      (e = a.charCodeAt(k++)),
      (j = (c << 16) | (d << 8) | e),
      (f = 63 & (j >> 18)),
      (g = 63 & (j >> 12)),
      (h = 63 & (j >> 6)),
      (i = 63 & j),
      (n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i));
  while (k < a.length);
  return (
    (m = n.join("")),
    (o = a.length % 3),
    (o ? m.slice(0, o - 3) : m) + "===".slice(o || 3)
  );
}

function basicAuth(event) {
  // Get request and request headers
  var request = event.request;
  var headers = request.headers;
  var viewer = event.viewer;

  // Configure authentication
  var authUser = "chilis";
  var authPass = "SP4tUVUI";
  var token = "1z2fqfo1lshbifn0djdo68bu54yr66";
  var ipWhitelist = [
    "142.189.120.194", // jacob
    "167.62.110.180" // fran
  ];

  // varruct the Basic Auth string
  var authString = "Basic " + encodeBase64(authUser + ":" + authPass);

  if (
    !ipWhitelist.includes(viewer.ip) &&
    (!token ||
      !request.querystring.token ||
      request.querystring.token.value !== token) &&
    (!token ||
      !headers.authorization ||
      headers.authorization.value !== token) &&
    (!headers.authorization || headers.authorization.value !== authString)
  ) {
    // Require Basic authentication
    var response = {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "www-authenticate": { value: "Basic" },
      },
    };
    return { response };
  }

  return event;
}

// eslint-disable-next-line no-unused-vars
function handler(event) {
  event = basicAuth(event);
  if (event.response) {
    return event.response;
  }

  return event.request;
}
