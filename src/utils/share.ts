export async function shareOrCopy(options: { title: string; text: string; url?: string }): Promise<'shared'|'copied'> {
  const url = options.url || window.location.href;
  if (navigator.share) {
    try { await navigator.share({ title: options.title, text: options.text, url }); return 'shared'; } catch { return 'shared'; }
  }
  await navigator.clipboard?.writeText(url);
  return 'copied';
}
