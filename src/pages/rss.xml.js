import rss, { pagesGlobToRssItems } from '@astrojs/rss';

export async function GET(context) {
    return rss({
        title: 'Data Science & Optimization Blog | Robert Donohue | Enverdex',
        description: 'Welcome to my blog, where I share my passion for data science, Bayesian learning, and sustainability.',
        site: context.site,
        items: await pagesGlobToRssItems(import.meta.glob('./**/*.md')),
        customData: `<language>es</language>`,
    });
}