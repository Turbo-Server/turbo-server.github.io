// Loaded without defer, in <head>: marks the page as scripted before it is painted, so the CSS can fold the
// mobile menu into a drawer (without JS its links stay visible as a row). Everything else waits for the DOM.
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function(){
    var root = document.documentElement,
        es = root.lang == 'es',
        hasObserver = 'IntersectionObserver' in window;

    // Header: transparent over the hero, solid (glass) once the hero is no longer behind it.
    var header = document.querySelector('.site-header'),
        hero = document.getElementById('Start');
    if(header && hero && hasObserver){
        new IntersectionObserver(function(entries){
            header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
        }, { rootMargin: '-' + header.offsetHeight + 'px 0px 0px 0px' }).observe(hero);
    }

    // Mobile menu: a button with aria-expanded that opens the drawer. Closes with Escape, a link, or a click outside.
    var toggle = document.querySelector('.menu-toggle'),
        nav = document.getElementById('site-nav');
    function setMenu(open, returnFocus){
        root.classList.toggle('menu-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if(!open && returnFocus){ toggle.focus(); }
    }
    if(toggle && nav){
        toggle.addEventListener('click', function(){ setMenu(!root.classList.contains('menu-open')); });
        nav.querySelectorAll('a').forEach(function(link){
            link.addEventListener('click', function(){ setMenu(false); });
        });
        document.addEventListener('keydown', function(event){
            if(event.key == 'Escape' && root.classList.contains('menu-open')){ setMenu(false, true); }
        });
        document.addEventListener('click', function(event){
            if(root.classList.contains('menu-open') && !nav.contains(event.target) && !toggle.contains(event.target)){ setMenu(false); }
        });
        if(window.matchMedia){
            var wide = window.matchMedia('(min-width: 961px)');
            var onWide = function(){ if(wide.matches){ setMenu(false); } };
            wide.addEventListener ? wide.addEventListener('change', onWide) : wide.addListener(onWide);
        }
    }

    // Highlight the menu link of the section crossing the middle of the viewport.
    if(nav && hasObserver){
        var links = {};
        nav.querySelectorAll('a[href*="#"]').forEach(function(link){ links[link.hash.slice(1)] = link; });
        var spy = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                var link = links[entry.target.id];
                if(!entry.isIntersecting || !link){ return; }
                nav.querySelectorAll('a.is-active').forEach(function(active){
                    active.classList.remove('is-active');
                    active.removeAttribute('aria-current');
                });
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'location');
            });
        }, { rootMargin: '-45% 0px -54% 0px' });
        document.querySelectorAll('main > article[id], footer[id]').forEach(function(section){ spy.observe(section); });
    }

    // Copy button on every code block. Prompt-style blocks ("> cmd") are copied as one line joined by "; ".
    var copyLabel = es ? 'Copiar' : 'Copy',
        copiedLabel = es ? '¡Copiado!' : 'Copied!';
    document.querySelectorAll('pre').forEach(function(pre){
        var wrap = document.createElement('div');
        wrap.className = 'code';
        pre.parentNode.insertBefore(wrap, pre);
        wrap.appendChild(pre);
        if(!navigator.clipboard){ return; }
        var button = document.createElement('button'),
            timer;
        button.type = 'button';
        button.className = 'copy';
        button.textContent = copyLabel;
        button.setAttribute('aria-live', 'polite');
        wrap.appendChild(button);
        button.addEventListener('click', function(){
            var text = pre.innerText.replace(/\r\n/g, '\n').replace(/\n+$/, '');
            if(/^>/.test(text)){
                text = text.split(/^>\s+/m).filter(Boolean).map(function(line){ return line.replace(/\s+$/, ''); }).join('; ');
            }
            navigator.clipboard.writeText(text).then(function(){
                button.textContent = copiedLabel;
                button.classList.add('is-copied');
                clearTimeout(timer);
                timer = setTimeout(function(){
                    button.textContent = copyLabel;
                    button.classList.remove('is-copied');
                }, 1600);
            });
        });
    });

    // Image viewer: screenshot links open the full-size image in a dialog (Escape or a click closes it).
    // Without JS (or <dialog>) they open the image itself.
    var viewer = document.createElement('dialog');
    if(viewer.showModal){
        var viewerImage = document.createElement('img'),
            viewerCaption = document.createElement('p');
        viewer.className = 'viewer';
        viewer.append(viewerImage, viewerCaption);
        document.body.appendChild(viewer);
        viewer.addEventListener('click', function(){ viewer.close(); });
        viewer.addEventListener('close', function(){ viewerImage.removeAttribute('src'); });
        document.querySelectorAll('a[href$=".webp"]').forEach(function(link){
            link.addEventListener('click', function(event){
                event.preventDefault();
                var image = link.querySelector('img');
                viewerImage.src = link.getAttribute('href');
                viewerImage.alt = image ? image.alt : '';
                viewerCaption.textContent = viewerImage.alt;
                viewer.showModal();
            });
        });
    }

    // Background rain of the hero: evenly spread drops with some jitter; negative delays so it is already raining.
    var rain = document.querySelector('.rain');
    if(rain){
        var count = Math.max(14, Math.min(44, Math.round(window.innerWidth / 34))),
            fragment = document.createDocumentFragment();
        for(var i = 0; i < count; i++){
            var drop = document.createElement('i'),
                duration = 1 + Math.random() * 1.4;
            drop.style.setProperty('--x', ((i + 0.5 + (Math.random() - 0.5) * 0.7) / count * 100).toFixed(2) + '%');
            drop.style.setProperty('--w', (i % 2 ? 1.5 : 2.25) + 'px');
            drop.style.setProperty('--h', Math.round(25 + Math.random() * 50) + 'vh');
            drop.style.setProperty('--o', (0.22 + Math.random() * 0.26).toFixed(2));
            drop.style.setProperty('--d', duration.toFixed(2) + 's');
            drop.style.setProperty('--delay', (-Math.random() * duration * 2).toFixed(2) + 's');
            fragment.appendChild(drop);
        }
        rain.appendChild(fragment);
    }

    // Documentation index (#toc) built from the h4 > h5 > h6 headings of #Docs (h6[data-no-toc] are skipped).
    var toc = document.getElementById('toc');
    function tocItem(list, heading){
        var item = document.createElement('li'),
            link = document.createElement('a');
        link.textContent = heading.textContent;
        link.setAttribute('href', '#' + heading.id);
        item.appendChild(link);
        list.appendChild(item);
        return item;
    }
    function subList(item){
        var list = document.createElement('ol');
        item.appendChild(list);
        return list;
    }
    if(toc){
        document.querySelectorAll('#Docs ol h4').forEach(function(h4){
            var item = tocItem(toc, h4),
                h5s = h4.parentNode.querySelectorAll('h5');
            if(!h5s.length){ return; }
            var h5List = subList(item);
            h5s.forEach(function(h5, i){
                h5.id = h4.id + '-' + i;
                var h5Item = tocItem(h5List, h5),
                    h6s = h5.parentNode.querySelectorAll('h6:not([data-no-toc])');
                if(!h6s.length){ return; }
                var h6List = subList(h5Item);
                h6s.forEach(function(h6, j){
                    h6.id = h5.id + '-' + j;
                    tocItem(h6List, h6);
                });
            });
        });
    }
});
