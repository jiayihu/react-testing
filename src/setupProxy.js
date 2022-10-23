const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/nordigen',
    createProxyMiddleware({
      target: 'https://ob.nordigen.com',
      changeOrigin: true,
      logLevel: "debug",
      logger: console,
      secure: false,
      pathRewrite: {'nordigen/' : ''}
    })
  );
};
