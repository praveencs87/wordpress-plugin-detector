import { Actor } from 'apify';
import { CheerioCrawler, log, enqueueLinks } from 'crawlee';

await Actor.init();

try {
    const input = await Actor.getInput();
    if (!input || !input.urls || input.urls.length === 0) {
        throw new Error('urls input is required!');
    }

    const { urls, deepCrawl = false } = input;
    
    // Store data per domain
    const domainData = new Map();

    const crawler = new CheerioCrawler({
        maxRequestsPerCrawl: deepCrawl ? urls.length * 5 : urls.length,
        
        async requestHandler({ request, $, enqueueLinks, log }) {
            const pageUrl = new URL(request.url);
            const domain = pageUrl.hostname;
            
            // Initialize domain data if not exists
            if (!domainData.has(domain)) {
                domainData.set(domain, {
                    domain,
                    isWordPress: false,
                    wpVersion: null,
                    theme: null,
                    plugins: new Set(),
                    scrapedAt: new Date().toISOString()
                });
            }
            
            const data = domainData.get(domain);
            
            // 1. Detect WordPress Version from Meta Generator
            const generator = $('meta[name="generator"]').attr('content');
            if (generator && generator.toLowerCase().includes('wordpress')) {
                data.isWordPress = true;
                if (!data.wpVersion) {
                    data.wpVersion = generator; // e.g. "WordPress 6.4.2"
                }
            }

            // 2. Extract Plugins and Themes from source paths
            // Check all scripts, links, and images for /wp-content/ paths
            const elements = $('script[src], link[href], img[src]').toArray();
            
            for (const el of elements) {
                const url = $(el).attr('src') || $(el).attr('href');
                if (!url) continue;

                // Mark as WordPress if we see wp-content or wp-includes
                if (url.includes('/wp-content/') || url.includes('/wp-includes/')) {
                    data.isWordPress = true;
                }

                // Match Plugins: /wp-content/plugins/plugin-slug/
                const pluginMatch = url.match(/\/wp-content\/plugins\/([^/]+)\//);
                if (pluginMatch && pluginMatch[1]) {
                    data.plugins.add(pluginMatch[1]);
                }

                // Match Theme: /wp-content/themes/theme-slug/
                const themeMatch = url.match(/\/wp-content\/themes\/([^/]+)\//);
                if (themeMatch && themeMatch[1] && !data.theme) {
                    data.theme = themeMatch[1];
                }
            }

            // If deepCrawl is enabled and this is the first time we visit the domain, queue internal links
            if (deepCrawl && request.userData.label !== 'DEEP_CRAWL') {
                await enqueueLinks({
                    strategy: 'same-domain',
                    limit: 4, // Max 4 more pages to hit the limit of 5 per domain
                    userData: { label: 'DEEP_CRAWL', domain }
                });
            }
            
            log.info(`Scanned ${request.url} - Found ${data.plugins.size} plugins so far.`);
        },
        
        async failedRequestHandler({ request, log }) {
            log.error(`Request ${request.url} failed too many times.`);
        },
    });

    log.info(`Starting crawler for ${urls.length} domains... (Deep Crawl: ${deepCrawl})`);
    
    const initialRequests = urls.map(u => ({ url: u.url || u, userData: { label: 'START' } }));
    await crawler.addRequests(initialRequests);
    await crawler.run();

    let analyzedCount = 0;

    // Push data to Apify dataset
    for (const [domain, data] of domainData.entries()) {
        const output = {
            ...data,
            plugins: Array.from(data.plugins) // Convert Set to Array
        };
        
        // Only charge for domains we successfully analyzed
        await Actor.charge({ eventName: 'website-analyzed', count: 1 });
        await Actor.pushData(output);
        analyzedCount++;
    }

    log.info(`🎉 Finished! Successfully analyzed ${analyzedCount} domains.`);
} catch (error) {
    log.error('Actor failed:', error);
    throw error;
}

await Actor.exit();
