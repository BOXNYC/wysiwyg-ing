/**
 * Parse markdown string to HTML
 */
export function parseMarkdown(md) {
  let html = md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/<u>(.+?)<\/u>/g, '<u>$1</u>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/^\> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^---$/gm, '<hr/>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ol-item">$1</li>')
    .replace(/^[-*] (.+)$/gm, '<li class="ul-item">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, text, url, title) => 
      title ? `<a href="${url}" title="${title}">${text}</a>` : `<a href="${url}">${text}</a>`
    )
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%"/>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre data-lang="${lang}"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
    )
    .replace(/<center>([\s\S]*?)<\/center>/g, '<center>$1</center>');

  // Wrap consecutive li items
  html = html.replace(/((?:<li class="ul-item">.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  html = html.replace(/((?:<li class="ol-item">.*<\/li>\n?)+)/g, '<ol>$1</ol>');
  html = html.replace(/<li class="[uo]l-item">/g, '<li>');

  // Wrap paragraphs
  html = html.split('\n\n').map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|ul|ol|blockquote|pre|hr)/.test(trimmed)) return trimmed;
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  }).join('\n');

  return html;
}

/**
 * Convert HTML element content to markdown
 */
export function htmlToMarkdown(element) {
  const process = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    
    const el = node;
    const tag = el.tagName.toLowerCase();
    const ch = Array.from(node.childNodes).map(process).join('');
    
    switch (tag) {
      case 'h1': return `# ${ch}\n\n`;
      case 'h2': return `## ${ch}\n\n`;
      case 'h3': return `### ${ch}\n\n`;
      case 'p': return `${ch}\n\n`;
      case 'strong': case 'b': return `**${ch}**`;
      case 'em': case 'i': return `*${ch}*`;
      case 'u': return `<u>${ch}</u>`;
      case 'del': case 's': case 'strike': return `~~${ch}~~`;
      case 'code': return el.parentElement?.tagName === 'PRE' ? ch : `\`${ch}\``;
      case 'pre': return `\`\`\`${el.getAttribute('data-lang') || ''}\n${el.textContent}\n\`\`\`\n\n`;
      case 'a': 
        const h = el.getAttribute('href') || '';
        const ti = el.getAttribute('title');
        return ti ? `[${ch}](${h} "${ti}")` : `[${ch}](${h})`;
      case 'img': return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`;
      case 'ul': return Array.from(el.children).map(li => `- ${process(li).trim()}`).join('\n') + '\n\n';
      case 'ol': return Array.from(el.children).map((li, i) => `${i + 1}. ${process(li).trim()}`).join('\n') + '\n\n';
      case 'li': return ch;
      case 'blockquote': return ch.split('\n').filter(l => l.trim()).map(l => `> ${l.trim()}`).join('\n') + '\n\n';
      case 'hr': return '\n---\n\n';
      case 'br': return '\n';
      case 'div': return ch ? `${ch}\n` : '\n';
      case 'center': return `<center>${ch}</center>`;
      default: return ch;
    }
  };
  
  return Array.from(element.childNodes).map(process).join('').replace(/\n{3,}/g, '\n\n').trim();
}
