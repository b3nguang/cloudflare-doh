/**
 * Cloudflare Worker that forwards requests based on path instead of subdomain
 * Example: doh.example.com/google/query-dns → dns.google/dns-query
 * Supports configuration via Cloudflare Worker variables
 */

// Default configuration for path mappings
const DEFAULT_PATH_MAPPINGS = {
	'/google': {
		targetDomain: 'dns.google',
		pathMapping: {
			'/fuck': '/dns-query',
		},
	},
	'/cloudflare': {
		targetDomain: 'cloudflare-dns.com',
		pathMapping: {
			'/fuck': '/dns-query',
		},
	},
	// Add more path mappings as needed
};

const HOMEPAGE_HTML = `<!DOCTYPE html>
	<html>
	<head>
	<title>Welcome to nginx!</title>
	<style>
		body {
			width: 35em;
			margin: 0 auto;
			font-family: Tahoma, Verdana, Arial, sans-serif;
		}
	</style>
	</head>
	<body>
	<h1>Welcome to nginx!</h1>
	<p>If you see this page, the nginx web server is successfully installed and
	working. Further configuration is required.</p>
	
	<p>For online documentation and support please refer to
	<a href="http://nginx.org/">nginx.org</a>.<br/>
	Commercial support is available at
	<a href="http://nginx.com/">nginx.com</a>.</p>
	
	<p><em>Thank you for using nginx.</em></p>
	</body>
	</html>`;

/**
 * Get path mappings from Cloudflare Worker env or use defaults
 * @param {Object} env - Environment variables from Cloudflare Worker
 * @returns {Object} Path mappings configuration
 */
function getPathMappings(env) {
	try {
		// Check if DOMAIN_MAPPINGS is defined in the env object
		if (env && env.DOMAIN_MAPPINGS) {
			// If it's a string, try to parse it as JSON
			if (typeof env.DOMAIN_MAPPINGS === 'string') {
				return JSON.parse(env.DOMAIN_MAPPINGS);
			}
			// If it's already an object, use it directly
			return env.DOMAIN_MAPPINGS;
		}
	} catch (error) {
		console.error('Error accessing DOMAIN_MAPPINGS variable:', error);
	}

	// Fall back to default mappings if the variable is not set
	return DEFAULT_PATH_MAPPINGS;
}

function serveHomepage() {
	// 直接返回内联的HTML内容，不再需要尝试从外部加载
	return new Response(HOMEPAGE_HTML, {
		status: 200,
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
}

async function handleRequest(request, env) {
	const url = new URL(request.url);
	const path = url.pathname;
	const queryString = url.search; // Preserves the query string with the '?'

	// If the path is explicitly '/index.html' or '/', serve the homepage
	if (path === '/index.html' || path === '/') {
		return serveHomepage();
	}

	// Get the path mappings from env or defaults
	const pathMappings = getPathMappings(env);

	// Find the matching path prefix
	const pathPrefix = Object.keys(pathMappings).find((prefix) => path.startsWith(prefix));

	if (pathPrefix) {
		const mapping = pathMappings[pathPrefix];
		const targetDomain = mapping.targetDomain;

		// Remove the prefix from the path
		const remainingPath = path.substring(pathPrefix.length);

		// Check if we have a specific path mapping for the remaining path
		let targetPath = remainingPath;
		for (const [sourcePath, destPath] of Object.entries(mapping.pathMapping)) {
			if (remainingPath.startsWith(sourcePath)) {
				targetPath = remainingPath.replace(sourcePath, destPath);
				break;
			}
		}

		// Construct the new URL with the preserved query string
		const newUrl = `https://${targetDomain}${targetPath}${queryString}`;

		// Clone the original request
		const newRequest = new Request(newUrl, {
			method: request.method,
			headers: request.headers,
			body: request.body,
			redirect: 'follow',
		});

		// Forward the request to the target domain
		return fetch(newRequest);
	}

	// If no mapping is found, serve the homepage instead of 404
	return serveHomepage();
}

// Export the worker
export default {
	async fetch(request, env, ctx) {
		return handleRequest(request, env);
	},
};
