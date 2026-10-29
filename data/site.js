document.addEventListener('DOMContentLoaded', function(){
    // Calls onVisible(state) / onHidden() on each matched element as it scrolls: 'is-active' when it fills
    // about half the viewport (or half of itself is visible), 'is-near' at about a quarter.
    function watchVisibility(selector, onVisible, onHidden){
        if(!window.IntersectionObserver){ return; }
        var observer = new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                if(!entry.isIntersecting){ return onHidden.call(entry.target); }
                var rect = entry.intersectionRect,
                    share = (rect.width * rect.height) / (window.innerWidth * window.innerHeight);
                if(entry.intersectionRatio > 0.49 || share > 0.49){ return onVisible.call(entry.target, 'is-active'); }
                if(entry.intersectionRatio > 0.24 || share > 0.24){ return onVisible.call(entry.target, 'is-near'); }
                onHidden.call(entry.target);
            });
        }, { threshold: Array.from({ length: 101 }, function(_, i){ return i / 100; }) });
        document.querySelectorAll(selector).forEach(function(element){ observer.observe(element); });
    }

    // Mobile menu: close it after choosing a link or pressing Escape.
    var menuToggle = document.getElementById('menu-toggle');
    if(menuToggle){
        document.querySelectorAll('#menu nav a').forEach(function(link){
            link.addEventListener('click', function(){ menuToggle.checked = false; });
        });
        document.addEventListener('keydown', function(event){
            if(event.key == 'Escape'){ menuToggle.checked = false; }
        });
    }

    // Compact floating menu once the page header is out of view.
    var menu = document.getElementById('menu');
    if(menu){
        watchVisibility('header',
            function(){ menu.classList.remove('is-compact'); },
            function(){ menu.classList.add('is-compact'); }
        );
    }

    // Highlight the menu link of the section being read.
    function navLink(section){
        return document.querySelector('[data-index] [href="/#' + section.id + '"]');
    }
    watchVisibility('main article, footer',
        function(state){
            var link = navLink(this);
            if(link){ link.classList.remove('is-active', 'is-near'); link.classList.add(state); }
        },
        function(){
            var link = navLink(this);
            if(link){ link.classList.remove('is-active', 'is-near'); }
        }
    );

    // "Copiar" button under every code block. Prompt-style blocks ("> cmd") are copied as one line joined by "; ".
    document.querySelectorAll('pre').forEach(function(pre){
        var bar = document.createElement('div'),
            button = document.createElement('a');
        button.className = 'copy';
        button.setAttribute('href', '#');
        bar.appendChild(button);
        pre.insertAdjacentElement('afterend', bar);
        button.addEventListener('click', function(event){
            event.preventDefault();
            setTimeout(function(){ button.blur(); }, 567);
            if(!navigator.clipboard){ return; }
            var text = pre.innerText.replace(/\r\n/g, '\n').replace(/\n+$/, '');
            if(/^>/.test(text)){
                text = text.split(/^>\s+/m).filter(Boolean).map(function(line){ return line.replace(/\s+$/, ''); }).join('; ');
            }
            navigator.clipboard.writeText(text);
            button.setAttribute('data-copied', '');
            setTimeout(function(){ button.removeAttribute('data-copied'); }, 1200);
        });
    });

    // Image viewer: screenshot links open in a dialog (Escape or a click closes it). Without JS they open the image itself.
    var viewer = document.createElement('dialog'),
        viewerImage = document.createElement('img'),
        viewerCaption = document.createElement('p');
    if(viewer.showModal){
        viewer.className = 'viewer';
        viewer.append(viewerImage, viewerCaption);
        document.body.appendChild(viewer);
        viewer.addEventListener('click', function(){ viewer.close(); });
        document.querySelectorAll('a[href$=".png"]').forEach(function(link){
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

    // Documentation index (#toc) built from the h4 > h5 > h6 headings of #Docs (h6[data-no-toc] are skipped).
    var toc = document.getElementById('toc');
    function tocItem(list, heading){
        var item = document.createElement('li'),
            link = document.createElement('a');
        link.innerText = heading.innerText;
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
