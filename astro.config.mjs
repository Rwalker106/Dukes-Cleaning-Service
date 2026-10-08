// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import favicons from 'astro-favicons';

// https://astro.build/config
export default defineConfig({
    site: "https://dukesprofessionalcleaningservices.com/",
    output: "static", // or "server"
    server: {
        open: true,
    },
    integrations: [
        favicons({
            themes: ["#1E3A8A", "#0F172A"],
        }),
    ],
    fonts: [
        {
            provider: fontProviders.google(),
            name: "Outfit",
            cssVariable: "--font-sans",
            weights: [400, 500, 600, 700, 800],
            subsets: ["latin"],
        },
    ],
});
