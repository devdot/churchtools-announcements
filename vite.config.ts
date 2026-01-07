import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'url';
import { defineConfig, loadEnv } from 'vite';
import eslintPlugin from 'vite-plugin-eslint';
// import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default ({ mode }) => {
    process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    return defineConfig({
        base: `/ccm/${process.env.VITE_KEY}/`,
        plugins: [
            // nodePolyfills(), // required for @churchtools/styleguide
            vue(),
            eslintPlugin({ fix: true }),
            tailwindcss()
        ],
        resolve: {
            dedupe: ['vue'],
            alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
        },
        define: {
            '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
        },
        server: {
            proxy: {
                '/system': {
                    target: 'https://' + process.env.VITE_BASE_URL,
                    changeOrigin: true,
                }
            }
        },
    });
};
