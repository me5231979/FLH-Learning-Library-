# Vercel Web Analytics Configuration

This project uses Vercel Web Analytics to track page views and user interactions.

## Current Implementation

Since this is a **static HTML site**, we use the **script tag method** as recommended by [Vercel's official documentation](https://vercel.com/docs/analytics/quickstart).

### How It Works

The analytics script is included in all HTML files using this code in the `<head>` section:

```html
<!-- Vercel Web Analytics (vercel-analytics): served only by Vercel, so it is skipped on GitHub Pages -->
<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  if (!/(^|\.)github\.io$/.test(location.hostname)) {
    var vaScript = document.createElement('script');
    vaScript.defer = true;
    vaScript.src = '/_vercel/insights/script.js';
    document.head.appendChild(vaScript);
  }
</script>
```

### Key Features

1. **Conditional Loading**: The script only loads when deployed on Vercel, not on GitHub Pages
2. **Deferred Loading**: Uses `defer` attribute for optimal performance
3. **Queue System**: The `window.va` function queues analytics calls until the script loads
4. **Zero Dependencies**: Works without any build system or npm packages

### Package Installation

The `@vercel/analytics` npm package has been installed for future use if the project transitions to a framework-based build system (React, Vue, Next.js, etc.). For the current static HTML implementation, the script tag method is the correct and recommended approach.

### Verification

After deployment to Vercel, verify analytics are working by:

1. Visit your site deployed on Vercel
2. Open browser DevTools > Network tab
3. Look for a request to `/_vercel/insights/view`
4. Check the Vercel dashboard > Analytics to see collected data

### Files with Analytics

Analytics is implemented across all HTML files in the project, including:
- Main pages (index.html, 404.html, etc.)
- Course pages and subdirectories
- Facilitator editions
- Worksheets and cheatsheets

## Additional Resources

- [Vercel Analytics Quickstart](https://vercel.com/docs/analytics/quickstart)
- [Vercel Analytics Dashboard](https://vercel.com/docs/analytics)
