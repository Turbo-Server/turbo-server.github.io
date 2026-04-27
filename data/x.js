document.addEventListener('DOMContentLoaded', function(A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U){
    function V(a, b, c, d, e){
        if(typeof b != 'function' && typeof c != 'function'){ return; }
        d = new IntersectionObserver(function(h){
            h.forEach(function(i, j, k){
                if(!i.isIntersecting){ return c.call(i.target, i); }
                j = i.intersectionRect,
                k = ((j.width * j.height) / (window.innerWidth * window.innerHeight));
                if(i.intersectionRatio > 0.49 || k > 0.49){ return b.call(i.target, 'A', j); }
                if(i.intersectionRatio > 0.24 || k > 0.24){ return b.call(i.target, 'B', j); }
                c.call(i.target);
            });
        }, { threshold: [0,0.01,0.02,0.03,0.04,0.05,0.06,0.07,0.08,0.09,0.1,0.11,0.12,0.13,0.14,0.15,0.16,0.17,0.18,0.19,0.2,0.21,0.22,0.23,0.24,0.25,0.26,0.27,0.28,0.29,0.3,0.31,0.32,0.33,0.34,0.35,0.36,0.37,0.38,0.39,0.4,0.41,0.42,0.43,0.44,0.45,0.46,0.47,0.48,0.49,0.5,0.51,0.52,0.53,0.54,0.55,0.56,0.57,0.58,0.59,0.6,0.61,0.62,0.63,0.64,0.65,0.66,0.67,0.68,0.69,0.70,0.71,0.72,0.73,0.74,0.75,0.76,0.77,0.78,0.79,0.8,0.81,0.82,0.83,0.84,0.85,0.86,0.87,0.88,0.89,0.9,0.91,0.92,0.93,0.94,0.95,0.96,0.97,0.98,0.99,1] });
        if(e = document.querySelectorAll(a)){ e.forEach(function(j){ d.observe(j); }); }
    }
    if((A = document.getElementById('m')) && (B = document.querySelectorAll('#M nav a'))){ B.forEach(function(a){ a.onclick = function(){ A.checked = false; } }); }
    if(C = document.getElementById('M')){ V('header', function(){ C.removeAttribute('class'); }, function(){ C.className = 'M'; }); }
    V(
        'main article',
        function(a, b){ if(b = document.querySelector('[data-index] [href="#' + this.id + '"]')){ b.className = a; } },
        function(a){ if(a = document.querySelector('[data-index] [href="#' + this.id + '"]')){ a.removeAttribute('class'); } }
    );
    if(D = document.getElementsByClassName('D')){
        for(E = 0; E < D.length; E++){
            D[E].onclick = function(e, f){
                e.preventDefault(), f = this, setTimeout(function(){ f.blur(); }, 567);
                if(navigator.clipboard && navigator.clipboard.writeText){
                    navigator.clipboard.writeText(f.innerText), f.parentNode.scrollLeft = 0;
                    return;
                } 
                window.location = f.innerText;
            }
        }
    }
    if(F = document.getElementsByTagName('pre')){
        for(E = 0; E < F.length; E++){
            G = document.createElement('div'), F[E].insertAdjacentElement('afterend', G);
            D = document.createElement('a'), 
            D.className = 'C', D.setAttribute('href', '#'), G.appendChild(D);
            D.onclick = function(e, f, g){
                e.preventDefault(), f = this, g = f.parentNode.previousElementSibling, setTimeout(function(){ f.blur(); }, 567);
                if(g.nodeName == 'PRE'){
                    g = g.innerText.replace(/[\r\n]*>[\s]+/g, '>').replace(/[\r\n]+$/g, '').replace(/\r\n/g, '\n').replace(/\n/g, '\r\n').split('>');
                    if(g[0] == ''){ g.shift(); }
                    g = g.join('; ');
                    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(g); }
                }
            }
        }
    }
    if(G = document.querySelectorAll('[data-text-tab-target]')){
        U = {};
        for(F = 0; F < G.length; F++){
            D = G[F].dataset.textTabTarget;
            if(!U[D]){ U[D] = []; }
            U[D].push(G[F]);
        }
        for(F in U){
            U[F].forEach(function(a){
                a.onclick = function(b, c, d, e, f){
                    b.preventDefault();
                    c = this.dataset.textTabTarget, d = this.dataset.textTabTargetBox;
                    if(e = document.querySelector(c)){
                        e.innerText = this.dataset.textTabContent;
                        if(d = document.querySelector(d)){ f = e.getBoundingClientRect(), d.scrollLeft = parseInt(f.left) + d.scrollLeft; }
                        if(U[c]){ U[c].forEach(function(e){ delete e.dataset.textTabSelected; }), this.dataset.textTabSelected = ''; }
                    }
                }
            });
        }
    }
    if(H = document.getElementById('I')){
        I = document.querySelectorAll('#Docs ol h4');
        for(E = 0; E < I.length; E++){
            J = document.createElement('a'), J.innerText = I[E].innerText, J.setAttribute('href', ('#' + I[E].id));
            K = document.createElement('li'), K.appendChild(J), H.appendChild(K);
            L = I[E].parentNode.querySelectorAll('h5');
            if(!L.length){ continue; }
            M = document.createElement('ol'), K.appendChild(M);
            for(F = 0; F < L.length; F++){
                L[F].id = (I[E].id + '-' + F);
                O = document.createElement('a'), O.innerText = L[F].innerText, O.setAttribute('href', ('#' + L[F].id));
                N = document.createElement('li'), N.appendChild(O), M.appendChild(N);
                P = L[F].parentNode.querySelectorAll('h6:not([data-x])');
                if(!P.length){ continue; }
                Q =  document.createElement('ol'), N.appendChild(Q);
                for(T = 0; T < P.length; T++){
                    P[T].id = (L[F].id + '-' + T);
                    R = document.createElement('a'), R.innerText = P[T].innerText, R.setAttribute('href', ('#' + P[T].id));
                    S = document.createElement('li'), S.appendChild(R), Q.appendChild(S);
                }
            }
        }
    }
});