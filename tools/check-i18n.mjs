#!/usr/bin/env node
// Checks that the English (index.html) and Spanish (es/index.html) pages share the same markup skeleton:
// the same elements, in the same order, with the same id and class attributes. Text and the other attributes
// (alt, href, content...) may differ. Run it after editing either page:  node tools/check-i18n.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = ['index.html', 'es/index.html'];
const INLINE = new Set(['a', 'b', 'i', 'em', 'strong', 'br', 'sub', 'sup', 'code', 'small', 'span', 'hr']);

function skeleton(file){
    const html = readFileSync(join(root, file), 'utf8')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
    const lines = html.split('\n');
    const tags = [];
    const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
    lines.forEach((line, i) => {
        let match;
        while((match = tagRe.exec(line))){
            const [, name, attrs] = match;
            // Inline formatting follows each language's wording, so only the structure is compared.
            if(INLINE.has(name.toLowerCase()) && !/\s(id|class)="/.test(attrs)){ continue; }
            const id = /\sid="([^"]*)"/.exec(attrs);
            const cls = /\sclass="([^"]*)"/.exec(attrs);
            const closing = match[0][1] === '/';
            tags.push({
                key: (closing ? '/' : '') + name.toLowerCase() + (id ? '#' + id[1] : '') + (cls ? '.' + cls[1].trim().split(/\s+/).join('.') : ''),
                line: i + 1
            });
        }
    });
    return tags;
}

const [a, b] = pages.map(skeleton);
const length = Math.max(a.length, b.length);
for(let i = 0; i < length; i++){
    if(!a[i] || !b[i] || a[i].key !== b[i].key){
        console.error('Markup differs at tag #' + (i + 1) + ':');
        console.error('  ' + pages[0] + ':' + (a[i] ? a[i].line + '  ' + a[i].key : 'end of file'));
        console.error('  ' + pages[1] + ':' + (b[i] ? b[i].line + '  ' + b[i].key : 'end of file'));
        process.exit(1);
    }
}
console.log('OK: both pages share the same markup skeleton (' + a.length + ' tags).');
