module.exports = {
    devServer: {
        proxy: {
            '/ws': {
                target: 'http://localhost:8222',
                // target: 'https://set.jakecoffman.com',
                changeOrigin: true,
                ws: true
            }
        }
    },
    pwa: {
        workboxOptions: {
            skipWaiting: true
        }
    }
}
