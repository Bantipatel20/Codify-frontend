const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',  // Changed from Vercel to local server
      changeOrigin: true,
      secure: false,  // Set to false for local development
      pathRewrite: {
        '^/api': '', // remove /api prefix when forwarding to target
      },
      onError: (err, req, res) => {
        console.log('Proxy Error:', err);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request to:', proxyReq.path);
      },
      logLevel: 'debug'
    })
  );
};
