// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

export default defineConfig({
	site: 'https://techmefr.github.io',
	base: '/beepr',
	integrations: [
		starlight({
			title: 'beepr',
			description: 'A tiny, typed event/notify engine — one handler contract, composable adapters, zero framework lock-in.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/techmefr/beepr' },
			],
			customCss: ['./src/styles/custom.css'],
			head: [
				{ tag: 'meta', attrs: { property: 'og:type', content: 'website' } },
				{ tag: 'meta', attrs: { property: 'og:site_name', content: 'beepr' } },
				{ tag: 'meta', attrs: { name: 'twitter:card', content: 'summary_large_image' } },
			],
			sidebar: [
				{
					label: 'Start here',
					items: [
						{ label: 'Introduction', slug: 'introduction' },
					],
				},
				{
					label: 'Guides',
					items: [
						{ label: 'Pairing with nexdk', slug: 'guides/pairing-with-nexdk' },
					],
				},
				{
					label: 'Reference',
					items: [
						{ label: 'beepr API', slug: 'reference/beepr' },
					],
				},
			],
		}),
		mdx(),
	],
});
