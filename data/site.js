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

        tocSpy(toc);
    }

    // Scroll-spy of the documentation index: marks the entry being read (.is-active, aria-current) and its
    // parents (.is-current), with a marker that slides along the index to it.
    //  - Reading line: a heading becomes the current one when it crosses a line a third of the way down the
    //    visible area (where the eyes rest while reading), not when it touches the header.
    //  - Scroll progress: in the last screen of the docs that line sweeps down to the bottom edge, so the short
    //    final sections, which can never reach the top, still get their turn as the reader advances.
    //  - Intent: an entry chosen from the index (or any link to a heading) stays marked while the page scrolls
    //    to it and once it lands, even near the end, until the reader scrolls by themselves.
    //  - Outside the docs (above the first heading, or once its end leaves the reading line) nothing is marked.
    function tocSpy(toc){
        var docs = document.getElementById('docs-list'),
            links = Array.prototype.slice.call(toc.querySelectorAll('a')),
            targets = links.map(function(link){ return document.getElementById(link.hash.slice(1)); }),
            byId = {},
            reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)'),
            marker = document.createElement('li'),
            current = null,
            pinned = null,
            settling = 0,
            ticking = false;
        if(!docs || !links.length){ return; }
        links.forEach(function(link, i){ byId[targets[i].id] = link; });
        marker.className = 'toc-marker';
        marker.setAttribute('aria-hidden', 'true');
        toc.appendChild(marker);

        function readingLine(){
            var top = header ? header.offsetHeight : 0,
                height = window.innerHeight,
                base = top + (height - top) * 0.3,
                // Distance left until the end of the docs reaches the bottom of the window.
                left = docs.getBoundingClientRect().bottom - height,
                sweep = Math.min(1, Math.max(0, 1 - left / (height - base)));
            return { base: base, line: base + (height - 8 - base) * sweep };
        }
        function find(){
            var reading = readingLine(),
                index = -1;
            if(docs.getBoundingClientRect().bottom < reading.base){ return null; }
            for(var i = 0; i < targets.length; i++){
                if(targets[i].getBoundingClientRect().top <= reading.line){ index = i; } else { break; }
            }
            return index < 0 ? null : links[index];
        }
        function place(){
            if(!current){ marker.classList.remove('is-visible'); return; }
            var box = toc.getBoundingClientRect(),
                rect = current.getBoundingClientRect();
            marker.style.transform = 'translateY(' + (rect.top - box.top - toc.clientTop + toc.scrollTop) + 'px)';
            marker.style.height = rect.height + 'px';
            marker.classList.add('is-visible');
        }
        function reveal(){
            // Keeps the entry in the middle part of the index when the index scrolls in its own box
            // (the page itself never moves).
            if(toc.scrollHeight <= toc.clientHeight){ return; }
            var box = toc.getBoundingClientRect(),
                rect = current.getBoundingClientRect(),
                margin = Math.min(96, box.height / 4);
            if(rect.top >= box.top + margin && rect.bottom <= box.bottom - margin){ return; }
            var top = toc.scrollTop + rect.top - box.top - box.height / 3;
            toc.scrollTo ? toc.scrollTo({ top: top, behavior: reduceMotion && reduceMotion.matches ? 'auto' : 'smooth' }) : (toc.scrollTop = top);
        }
        function mark(link){
            if(link === current){ return; }
            toc.querySelectorAll('.is-active, .is-current').forEach(function(item){ item.classList.remove('is-active', 'is-current'); });
            if(current){ current.removeAttribute('aria-current'); }
            current = link;
            if(link){
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'location');
                for(var item = link.parentNode.parentNode.closest('li'); item && toc.contains(item); item = item.parentNode.closest('li')){
                    item.firstElementChild.classList.add('is-current');
                }
                reveal();
            }
            place();
        }
        function update(){
            ticking = false;
            mark(pinned || find());
        }
        function request(){
            if(!ticking){ ticking = true; requestAnimationFrame(update); }
        }
        // The jump to a chosen heading is "settling" until its scroll stops for a moment; a scroll after that
        // is the reader's own, and frees the pinned entry.
        function settle(delay){
            clearTimeout(settling);
            settling = setTimeout(function(){ settling = 0; request(); }, delay);
        }
        function choose(id){
            var link = byId[id];
            if(!link){ return; }
            pinned = link;
            mark(link);
            settle(300);
        }

        window.addEventListener('scroll', function(){
            if(settling){ settle(150); return; }
            pinned = null;
            request();
        }, { passive: true });
        window.addEventListener('resize', function(){ place(); request(); });
        document.addEventListener('click', function(event){
            var link = event.target.closest && event.target.closest('a[href*="#"]');
            if(link && link.pathname == location.pathname && link.hostname == location.hostname){ choose(decodeURIComponent(link.hash.slice(1))); }
        });
        window.addEventListener('hashchange', function(){ choose(decodeURIComponent(location.hash.slice(1))); });
        if(location.hash && byId[decodeURIComponent(location.hash.slice(1))]){ choose(decodeURIComponent(location.hash.slice(1))); }
        else { update(); }
    }
});
