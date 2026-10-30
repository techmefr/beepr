// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import starlight from '@astrojs/starlight';
import mdx from '@astrojs/mdx';

export default defineConfig({
	image: { service: passthroughImageService() },
	site: 'https://techmefr.github.io',
	base: '/beepr',
	integrations: [
		starlight({
			title: 'beepr',
			logo: { light: './src/assets/logo.svg', dark: './src/assets/logo-dark.svg', alt: '' },
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
			expressiveCode: { defaultProps: { frame: 'terminal' } },
			favicon: '/favicon.svg',
			sidebar: [
    {
        "label": "Start here",
        "items": [
            {
                "label": "Introduction",
                "slug": "introduction"
            },
            {
                "label": "Installation & quickstart",
                "slug": "getting-started"
            }
        ]
    },
    {
        "label": "Guides",
        "items": [
            {
                "label": "Events & adapters",
                "slug": "guides/events"
            },
            {
                "label": "Compose handlers",
                "slug": "guides/composition"
            },
            {
                "label": "Multiple listeners",
                "slug": "guides/hooks"
            },
            {
                "label": "Pairing with neXdk",
                "slug": "guides/pairing-with-nexdk"
            }
        ]
    },
    {
        "label": "Reference",
        "items": [
            {
                "label": "beepr API",
                "slug": "reference/beepr"
            }
        ]
    },
    {
        "label": "Ecosystem",
        "items": [
            {
                "label": "neXdk",
                "link": "https://techmefr.github.io/nexdk/"
            },
            {
                "label": "shamock",
                "link": "https://techmefr.github.io/shamock/"
            },
            {
                "label": "HeryJs",
                "link": "https://techmefr.github.io/HeryJs/"
            }
        ]
    }
],

		}),
		mdx(),
	],
});
