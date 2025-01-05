const nextConfig = {
    outputFileTracingIncludes: {
        '/api/**/*': ['./api/**/*', './requirements.txt'],
    },
    outputFileTracingExcludes: {
        '/api/**/*': ['./api/rq_worker.py'],
    },
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination:
                    process.env.NODE_ENV === 'development'
                        ? 'http://127.0.0.1:5328/api/:path*'
                        : '/api/',
            },
        ]
    },
}

export default nextConfig;
