export function isMobileOrTablet(): boolean {
  const userAgent = navigator.userAgent
  if (/android/i.test(userAgent)) {
    return true
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return true
  }
  return false
}
