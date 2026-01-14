export function slugify(text: string): string {
    if (!text) return '';

    // Arabic to Latin mapping (Franco-Arab style / phonetic)
    const arabicMap: { [key: string]: string } = {
        'ا': 'a', 'أ': 'a', 'إ': 'e', 'آ': 'a', 'ء': 'a',
        'ب': 'b', 'ت': 't', 'ث': 'th',
        'ج': 'g', 'ح': '7', 'خ': '5',
        'د': 'd', 'ذ': 'th',
        'ر': 'r', 'z': 'z', 'ز': 'z',
        'س': 's', 'ش': 'sh',
        'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
        'ع': '3', 'غ': 'gh',
        'ف': 'f', 'ق': 'q',
        'ك': 'k', 'ل': 'l', 'm': 'm', 'م': 'm',
        'ن': 'n', 'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a',
        'ة': 'a',
        '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
        '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
        '؟': '', '،': '-', '؛': '',
        ' ': '-'
    };

    // First replace Arabic characters
    let processed = text.split('').map(char => arabicMap[char] || char).join('');

    // Then standar slugification
    processed = processed
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')    // Remove non-word chars (except spaces and hyphens)
        .replace(/[\s_-]+/g, '-')    // Replace spaces and underscores with single hyphen
        .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens

    // Fallback for empty results (e.g. only emojis)
    if (!processed) {
        return 'store-' + Math.random().toString(36).substring(2, 8);
    }

    return processed;
}
