import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['lightningcss']
	},
	ssr: {
		noExternal: ['lightningcss']
	},
	define: {
		'process.env.LIGHTNINGCSS_SKIP_NATIVE': JSON.stringify('true')
	}
});
