export function isMobileOrTablet(): boolean {
  const userAgent = navigator.userAgent
  if (/android/iu.test(userAgent)) {
    return true
  }
  if (/iPad|iPhone|iPod/u.test(userAgent) && !window.MSStream) {
    return true
  }
  return false
}
