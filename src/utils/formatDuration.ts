export function formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0) {
        return "now";
    }

    const days = Math.floor(totalSeconds / (3600 * 24));
    totalSeconds %= (3600 * 24);
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const parts: string[] = [];
    if (days > 0) {
        parts.push(`${days} day${days > 1 ? 's' : ''}`);
    }
    if (hours > 0) {
        parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
    }
    if (minutes > 0) {
        parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
    }
    if (seconds > 0 || parts.length === 0) { // Always show seconds if no other parts or if it's the only unit
        parts.push(`${seconds} second${seconds !== 1 ? 's' : ''}`);
    }

    // Only show the most significant units (e.g., up to 2 or 3 parts for brevity)
    // For example, if it's "1 day 0 hours 5 minutes", just show "1 day 5 minutes"
    const significantParts = parts.filter(part => !part.startsWith("0 ")); // Simple filter

    if (significantParts.length === 0) { // Should ideally be caught by totalSeconds <= 0
      return "a moment";
    }

    return significantParts.join(' ');
}