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
			'/query-dns': '/dns-query',
		},
	},
	'/cloudflare': {
		targetDomain: 'cloudflare-dns.com',
		pathMapping: {
			'/query-dns': '/dns-query',
		},
	},
	// Add more path mappings as needed
};

const HOMEPAGE_HTML = `<!DOCTYPE html>
  <html lang="zh-CN">
  
  <head>
	  <meta charset="UTF-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1.0">
	  <title>Cloudflare DoH 转发代理 - 简单高效的 DNS over HTTPS 代理服务</title>
	  <style>
		  :root {
			  --primary-color: #f6821f;
			  --secondary-color: #3b88c3;
			  --dark-color: #404041;
			  --light-color: #f4f4f4;
			  --success-color: #5cb85c;
			  --error-color: #d9534f;
		  }
  
		  * {
			  box-sizing: border-box;
			  margin: 0;
			  padding: 0;
		  }
  
		  body {
			  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
			  line-height: 1.6;
			  color: #333;
			  background-color: var(--light-color);
		  }
  
		  .container {
			  max-width: 1100px;
			  margin: 0 auto;
			  padding: 0 20px;
		  }
  
		  header {
			  background-color: var(--primary-color);
			  color: white;
			  text-align: center;
			  padding: 2rem 0;
			  margin-bottom: 2rem;
		  }
  
		  header h1 {
			  font-size: 2.5rem;
			  margin-bottom: 0.5rem;
		  }
  
		  .subtitle {
			  font-size: 1.2rem;
			  font-weight: 300;
		  }
  
		  section {
			  margin: 2rem 0;
			  padding: 1.5rem;
			  background-color: white;
			  border-radius: 5px;
			  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		  }
  
		  h2 {
			  color: var(--primary-color);
			  margin-bottom: 1rem;
			  border-bottom: 1px solid #eee;
			  padding-bottom: 0.5rem;
		  }
  
		  h3 {
			  color: var(--secondary-color);
			  margin: 1rem 0;
		  }
  
		  ul,
		  ol {
			  margin: 1rem 0 1rem 1.5rem;
		  }
  
		  li {
			  margin-bottom: 0.5rem;
		  }
  
		  pre {
			  background-color: #f8f8f8;
			  padding: 1rem;
			  border-radius: 5px;
			  overflow-x: auto;
			  margin: 1rem 0;
			  border-left: 4px solid var(--primary-color);
		  }
  
		  code {
			  font-family: 'Courier New', monospace;
		  }
  
		  .example {
			  background-color: #f9f9f9;
			  padding: 1rem;
			  border-radius: 5px;
			  margin: 1rem 0;
		  }
  
		  .card {
			  border: 1px solid #ddd;
			  border-radius: 5px;
			  padding: 1.5rem;
			  margin: 1rem 0;
		  }
  
		  .sponsor {
			  background-color: #fff8e1;
			  border-left: 4px solid var(--primary-color);
		  }
  
		  .cta {
			  text-align: center;
			  margin: 2rem 0;
		  }
  
		  .btn {
			  display: inline-block;
			  background-color: var(--primary-color);
			  color: white;
			  padding: 0.75rem 1.5rem;
			  border: none;
			  border-radius: 5px;
			  text-decoration: none;
			  font-weight: bold;
			  transition: background-color 0.3s;
		  }
  
		  .btn:hover {
			  background-color: #e67e22;
		  }
  
		  .github-link {
			  text-align: center;
			  margin-bottom: 1rem;
		  }
  
		  footer {
			  text-align: center;
			  padding: 2rem 0;
			  background-color: var(--dark-color);
			  color: white;
			  margin-top: 2rem;
		  }
  
		  .grid {
			  display: grid;
			  grid-template-columns: repeat(2, 1fr);
			  gap: 2rem;
		  }
  
		  @media (max-width: 768px) {
			  .grid {
				  grid-template-columns: 1fr;
			  }
		  }
	  </style>
  </head>
  
  <body>
	  <header>
		  <div class="container">
			  <h1>Cloudflare DoH 转发代理</h1>
			  <p class="subtitle">一个轻量级的 DNS over HTTPS (DoH) 转发代理服务</p>
		  </div>
	  </header>
  
	  <div class="container">
		  <section>
			  <h2>项目介绍</h2>
			  <p>Cloudflare DoH 转发代理是一个基于 Cloudflare Workers 的轻量级服务，能够根据请求路径将 DNS 查询转发到不同的 DoH 服务提供商，同时保留原始查询参数。</p>
  
			  <h3>主要功能</h3>
			  <ul>
				  <li><strong>基于路径的转发</strong>：根据请求路径确定转发目标</li>
				  <li><strong>多提供商支持</strong>：支持 Google、Cloudflare 等多家 DoH 服务提供商</li>
				  <li><strong>自定义配置</strong>：通过环境变量灵活配置转发规则</li>
				  <li><strong>保留查询参数</strong>：完整保留原始请求中的查询参数</li>
				  <li><strong>轻量级部署</strong>：基于 Cloudflare Worker/Pages，无需维护服务器</li>
			  </ul>
		  </section>
  
		  <section>
			  <h2>使用方法</h2>
			  <p>本服务已部署到 Cloudflare，您可以直接使用以下地址进行 DNS 查询：</p>
  
			  <h3>转发到 Google DoH 服务</h3>
			  <div class="example">
				  <code>https://doh-proxy.example.com/google/query-dns?name=example.com</code>
			  </div>
  
			  <h3>转发到 Cloudflare DoH 服务</h3>
			  <div class="example">
				  <code>https://doh-proxy.example.com/cloudflare/query-dns?name=example.com</code>
			  </div>
  
			  <h3>HTTP 请求示例</h3>
			  <pre><code>curl -H "accept: application/dns-json" "https://doh-proxy.example.com/google/query-dns?name=example.com&type=A"</code></pre>
		  </section>
  
		  <div class="grid">
			  <section>
				  <h2>自托管部署</h2>
				  <p>您可以使用以下两种方法部署自己的 DoH 转发代理：</p>
  
				  <h3>方法一：使用 Cloudflare Workers</h3>
				  <ol>
					  <li>登录到 <a href="https://dash.cloudflare.com/" target="_blank">Cloudflare 控制台</a></li>
					  <li>进入 Workers 部分并点击"创建服务"</li>
					  <li>将项目代码粘贴到编辑器中</li>
					  <li>配置环境变量（可选）</li>
					  <li>点击"部署"按钮</li>
				  </ol>
  
				  <h3>方法二：使用 Cloudflare Pages</h3>
				  <ol>
					  <li>将项目代码推送到 Git 仓库</li>
					  <li>在 Cloudflare Pages 中创建新项目并连接到您的仓库</li>
					  <li>完成基本配置后部署即可</li>
				  </ol>
  
				  <div class="github-link">
					  <p>获取完整部署说明:</p>
					  <a href="https://github.com/jqknono/cloudflare-doh" class="btn" target="_blank">GitHub 仓库</a>
				  </div>
			  </section>
  
			  <section>
				  <h2>自定义配置</h2>
				  <p>您可以通过设置环境变量 <code>DOMAIN_MAPPINGS</code> 来自定义路径映射规则：</p>
  
				  <pre><code>{
	"/google": {
	  "targetDomain": "dns.google",
	  "pathMapping": {
		"/query-dns": "/dns-query"
	  }
	},
	"/cloudflare": {
	  "targetDomain": "one.one.one.one",
	  "pathMapping": {
		"/query-dns": "/dns-query"
	  }
	},
	"/quad9": {
	  "targetDomain": "dns.quad9.net",
	  "pathMapping": {
		"/query-dns": "/dns-query"
	  }
	}
  }</code></pre>
  
				  <p>配置说明：</p>
				  <ul>
					  <li>键名为路径前缀，如 <code>/google</code></li>
					  <li><code>targetDomain</code> 为目标域名</li>
					  <li><code>pathMapping</code> 定义路径映射规则</li>
				  </ul>
			  </section>
		  </div>
  
		  <section>
			  <h2>浏览器 DoH 设置方法</h2>
			  <p>以下是在不同浏览器中配置 DNS over HTTPS (DoH) 的方法：</p>
  
			  <div class="card">
				  <h3>Firefox 浏览器设置</h3>
				  <ol>
					  <li>打开 Firefox，在地址栏中输入 <code>about:preferences#general</code></li>
					  <li>滚动到页面底部找到"网络设置"部分</li>
					  <li>点击"设置"按钮</li>
					  <li>滚动到底部，勾选"启用基于 HTTPS 的 DNS"</li>
					  <li>选择"自定义"选项，并输入以下 URL（以 Google 为例）：<br>
						  <code>https://your-worker-domain.com/google/query-dns</code>
					  </li>
					  <li>点击"确定"保存设置</li>
				  </ol>
			  </div>
  
			  <div class="card">
				  <h3>Chrome 浏览器设置</h3>
				  <ol>
					  <li>打开 Chrome，在地址栏中输入 <code>chrome://settings/security</code></li>
					  <li>找到"安全浏览和安全"部分</li>
					  <li>点击"使用安全 DNS 服务"</li>
					  <li>选择"自定义"选项，并输入以下 URL（以 Cloudflare 为例）：<br>
						  <code>https://your-worker-domain.com/cloudflare/query-dns</code>
					  </li>
				  </ol>
				  <p>注意：Chrome 只允许使用预定义的 DoH 提供商或自定义提供商，但有些版本可能限制对自定义 DoH 服务的支持。</p>
			  </div>
  
			  <div class="card">
				  <h3>Edge 浏览器设置</h3>
				  <ol>
					  <li>打开 Edge，在地址栏中输入 <code>edge://settings/privacy</code></li>
					  <li>滚动到"安全"部分</li>
					  <li>找到"使用安全 DNS 服务指定如何查找网站的网络地址"</li>
					  <li>选择"自定义"选项，并输入以下 URL（以 Google 为例）：<br>
						  <code>https://your-worker-domain.com/google/query-dns</code>
					  </li>
				  </ol>
			  </div>
  
              <h2>操作系统级别设置</h3>
			  <div class="card">
				  <h4>Windows 11 设置</h4>
				  <ol>
					  <li>打开设置 &gt; 网络和 Internet &gt; Wi-Fi 或以太网（取决于您的连接类型）</li>
					  <li>点击您的网络连接</li>
					  <li>在"DNS 服务器分配"部分，选择"编辑"</li>
					  <li>将"IPv4 DNS 服务器"设置更改为"手动"</li>
					  <li>开启"IPv4 的 DNS over HTTPS"</li>
					  <li>在"首选 DNS"字段输入 DoH 提供商的 IP 地址</li>
					  <li>在"首选 DoH 模式"下拉菜单中选择"自定义"并输入您的 DoH URL：<br>
						  <code>https://your-worker-domain.com/google/query-dns</code>
					  </li>
				  </ol>
  
                  <h4>macOS/iOS 设置</h4>
                  <ol>
                      <li>通过 <a href="https://dns.notjakob.com/tool.html" target="_blank">DNS Profile Creator</a> 等工具生成 DoH 配置描述文件</li>
                      <li>将配置文件下载到您的设备上</li>
                      <li>在 macOS 上：
                          <ul>
                              <li>双击下载的配置文件</li>
                              <li>在系统设置中找到"配置文件"</li>
                              <li>点击"安装"并输入管理员密码确认</li>
                          </ul>
                      </li>
                      <li>在 iOS 上：
                          <ul>
                              <li>打开下载的配置文件</li>
                              <li>点击"设置"应用程序中的通知</li>
                              <li>点击"安装配置文件"</li>
                              <li>输入设备密码确认安装</li>
                          </ul>
                      </li>
                      <li>安装完成后，设备将自动使用配置的 DoH 服务器</li>
                  </ol>
  
				  <h4>Android 设置</h4>
				  <p>Android 暂不支持 DoH</p>
			  </div>
		  </section>
  
		  <section class="sponsor card">
			  <h2>赞助商</h2>
			  <h3><a href="https://www.adguardprivate.com" target="_blank">AdGuard Private</a> - 企业级 DNS 解析服务</h3>
			  <p>感谢 <a href="https://www.adguardprivate.com" target="_blank">AdGuard Private</a> 对本项目的支持！</p>
			  <ul>
				  <li><strong>无限制查询</strong>：不受请求次数限制</li>
				  <li><strong>隐私保护</strong>：增强的隐私保护机制</li>
				  <li><strong>广告过滤</strong>：智能过滤广告和追踪器</li>
				  <li><strong>灵活配置</strong>：支持自定义 DNS 记录</li>
				  <li><strong>动态 DNS</strong>：内置 DDNS 功能</li>
			  </ul>
			  <div class="cta">
				  <a href="https://www.adguardprivate.com" class="btn" target="_blank">了解更多</a>
			  </div>
		  </section>
  
		  <section>
			  <h2>常见问题</h2>
			  <div class="card">
				  <h3>什么是 DNS over HTTPS (DoH)？</h3>
				  <p>DoH 是一种加密 DNS 查询的协议，它通过 HTTPS 协议发送 DNS 查询，防止中间人攻击和隐私泄露。</p>
			  </div>
			  <div class="card">
				  <h3>为什么需要 DoH 转发代理？</h3>
				  <p>DoH 转发代理可以帮助绕过网络限制、提供统一的接口调用多个 DoH 服务提供商，并在提供商之间快速切换。</p>
			  </div>
			  <div class="card">
				  <h3>使用此服务是否安全？</h3>
				  <p>本服务仅转发请求，不会修改或存储您的 DNS 查询内容。但请注意，您的 DNS 查询内容仍会被目标 DoH 提供商处理。</p>
			  </div>
			  <div class="card">
				  <h3>免费版有什么限制？</h3>
				  <p>Cloudflare Workers 免费版每日有 100,000 次请求限制，足够个人使用，但不适合大规模部署。</p>
			  </div>
		  </section>
  
		  <div class="cta">
			  <h2>开始使用</h2>
			  <p>立即部署您自己的 DoH 转发代理，或直接使用我们的服务</p>
			  <a href="https://github.com/jqknono/cloudflare-doh" class="btn">获取代码</a>
		  </div>
	  </div>
  
	  <footer>
		  <div class="container">
			  <p>Cloudflare DoH 转发代理 &copy; 2023</p>
			  <p>基于 MIT 许可协议开源</p>
		  </div>
	  </footer>
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
