export function readingTimeMinutes(text: string, wpm = 200): number {
    const words = (text || "")
        .replace(/`{1,3}[\s\S]*?`{1,3}/g, " ")   // strip inline/code blocks roughly
        .replace(/<[^>]*>/g, " ")               // strip HTML tags
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.round(words / wpm));
}