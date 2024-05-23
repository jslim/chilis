export function isValidDomain(domain: string) {
  const domainRegex =
    /^(?!:\/\/)([a-zA-Z0-9-_]{1,63}\.)*[a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}
