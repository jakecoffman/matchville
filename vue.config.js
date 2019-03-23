module.exports = {
    devServer: {
        proxy: {
            '/ws': {
                // target: 'http://localhost:8112',
                target: 'https://set.jakecoffman.com',
                changeOrigin: true,
                ws: true
            }
        }
    }
}
