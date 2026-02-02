# PWA Installation Troubleshooting Guide

## Common Issues and Solutions

### 1. Install Button Not Appearing

**Possible Causes:**
- App is already installed
- Service worker not registered
- Not running in production mode
- Missing HTTPS (required for production, not localhost)

**Solutions:**
- Check if app is already installed: Look for the app icon on your home screen
- Build and run in production mode:
  ```bash
  npm run build
  npm start
  ```
- Check browser console for service worker errors
- Verify manifest.json is accessible at `/manifest.json`

### 2. Service Worker Not Registering

**Check:**
1. Open Chrome DevTools → Application tab → Service Workers
2. Look for registered service workers
3. Check for any errors

**If service worker is missing:**
- Ensure you're running a production build (`npm run build && npm start`)
- PWA is disabled in development mode by default
- Check `next.config.js` - `disable: process.env.NODE_ENV === 'development'`

### 3. Manifest Issues

**Verify manifest.json:**
- Open `/manifest.json` in browser - should return valid JSON
- Check that all required fields are present:
  - `name` or `short_name`
  - `start_url`
  - `display`
  - `icons` (at least one 192x192 and one 512x512)

**Test manifest:**
- Chrome DevTools → Application → Manifest
- Look for any validation errors

### 4. Icons Not Loading

**Check:**
- Icons exist in `/public/icon-192x192.png` and `/public/icon-512x512.png`
- Icons are accessible (try opening `/icon-192x192.png` in browser)
- Icon paths in manifest.json are correct (should start with `/`)

### 5. HTTPS Requirement

**Important:**
- PWAs require HTTPS in production (except localhost)
- If deploying, ensure your hosting platform provides HTTPS
- Local development on `localhost` works without HTTPS

### 6. Browser Compatibility

**Supported Browsers:**
- Chrome/Edge (Android & Desktop) ✅
- Safari (iOS 11.3+) ✅
- Firefox (Android) ✅
- Samsung Internet ✅

**Not Supported:**
- Older browsers
- Some mobile browsers

### 7. Testing PWA Installation

**Desktop (Chrome/Edge):**
1. Build and start production server: `npm run build && npm start`
2. Open `http://localhost:3000`
3. Look for install icon in address bar (or use the install button)
4. Click install

**Mobile (Android Chrome):**
1. Deploy to a server with HTTPS
2. Open the site in Chrome
3. Tap the menu (3 dots) → "Add to Home Screen" or "Install App"

**Mobile (iOS Safari):**
1. Open the site in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### 8. Debugging Steps

1. **Check Service Worker:**
   ```
   Chrome DevTools → Application → Service Workers
   ```

2. **Check Manifest:**
   ```
   Chrome DevTools → Application → Manifest
   ```

3. **Check Console:**
   - Look for PWA-related errors
   - Check for service worker registration messages

4. **Verify Build:**
   - Ensure `public/sw.js` exists after build
   - Check that service worker files are generated

5. **Test in Incognito:**
   - Sometimes browser extensions interfere
   - Test in incognito/private mode

### 9. Enable PWA in Development (for testing)

If you want to test PWA in development mode, modify `next.config.js`:

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Change this to false
});
```

**Note:** You'll need to rebuild after changing this.

### 10. Common Error Messages

**"Site cannot be installed: no matching service worker detected"**
- Service worker not registered
- Run production build
- Check service worker registration in DevTools

**"Manifest: property 'icons' is required"**
- Check manifest.json has icons array
- Verify icon files exist

**"Site cannot be installed: the page does not work offline"**
- Service worker needs to cache resources
- Check service worker is functioning

## Quick Checklist

- [ ] Built with `npm run build`
- [ ] Running with `npm start` (production mode)
- [ ] Manifest.json accessible at `/manifest.json`
- [ ] Icons exist and are accessible
- [ ] Service worker registered (check DevTools)
- [ ] HTTPS enabled (for production, not needed for localhost)
- [ ] Browser supports PWA (Chrome, Edge, Safari iOS, etc.)
- [ ] Not already installed

## Still Having Issues?

1. Check browser console for specific error messages
2. Verify all files are properly built and deployed
3. Test on a different browser/device
4. Clear browser cache and service workers
5. Check that your hosting platform supports PWA (most do)

