// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔧 Proxy setup starting...');
  
  app.use(
    ['/login', '/users', '/user', '/api'],
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      onError: (err, req, res) => {
        console.error('❌ Proxy Error:', err.message);
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log(`🔄 Proxying: ${req.method} ${req.url} → http://localhost:5000${req.url}`);
      },
      onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
      }
    })
  );
  
  console.log('✅ Proxy setup complete');
};
