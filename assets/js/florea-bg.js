// Membuat tangkai bunga lily pink (3 bunga per tangkai) yang bermekaran di latar halaman Florea.
(function () {
    var container = document.querySelector('.lilies');
    if (!container) return;

    var NS = 'http://www.w3.org/2000/svg';

    // Posisi titik tengah tangkai (persen layar), lebar, kemiringan, dan jeda mulai tumbuh.
    // tilt 0 = tangkai tumbuh ke atas, 180 = menjuntai ke bawah.
    // "sm" = tangkai tambahan yang disembunyikan di layar HP.
    var STEMS = [
        { x: '7%',  y: '80%', size: 'clamp(230px, 30vw, 430px)', tilt: 18,   delay: 0 },
        { x: '93%', y: '82%', size: 'clamp(230px, 30vw, 430px)', tilt: -20,  delay: 0.3 },
        { x: '94%', y: '14%', size: 'clamp(210px, 27vw, 390px)', tilt: 205,  delay: 0.6 },
        { x: '6%',  y: '12%', size: 'clamp(210px, 27vw, 390px)', tilt: 155,  delay: 0.9 },
        { x: '2%',  y: '47%', size: 'clamp(170px, 20vw, 300px)', tilt: 75,   delay: 1.2, sm: true },
        { x: '98%', y: '50%', size: 'clamp(170px, 20vw, 300px)', tilt: -75,  delay: 1.4, sm: true }
    ];

    // Tiga bunga per tangkai: posisi di dalam SVG, skala, dan jeda mekar relatif terhadap tangkai.
    var FLOWERS = [
        { x: 0,   y: -100, scale: 0.85, delay: 0.5 },
        { x: -86, y: -6,   scale: 0.7,  delay: 0.7 },
        { x: 88,  y: 30,   scale: 0.65, delay: 0.9 }
    ];

    var STEM_PATHS = [
        'M0 210 C 4 120, -6 20, 0 -100',
        'M1 72 C -28 52, -60 32, -86 -6',
        'M2 124 C 40 104, 70 72, 88 30'
    ];

    // Daun lily yang panjang dan ramping di sepanjang batang: x, y, sudut, skala.
    var LEAVES = [
        [1, 196, 32, 0.8], [2, 168, -52, 0.85], [1, 142, 48, 0.75],
        [-1, 100, -38, 0.7], [-2, 62, 34, 0.62], [-44, 44, -68, 0.5],
        [52, 98, 66, 0.55], [-3, 18, -26, 0.5]
    ];

    var PETAL = 'M0 0 C 30 -16, 36 -64, 0 -98 C -36 -64, -30 -16, 0 0 Z';
    var LEAF = 'M0 0 C 12 -30, 10 -80, 0 -112 C -10 -80, -12 -30, 0 0 Z';

    function el(name, attrs) {
        var node = document.createElementNS(NS, name);
        for (var k in attrs) node.setAttribute(k, attrs[k]);
        return node;
    }

    // Gradien dipakai bersama oleh semua bunga.
    function buildDefs() {
        var svg = el('svg', { width: 0, height: 0, 'aria-hidden': 'true' });
        svg.style.position = 'absolute';
        svg.innerHTML =
            '<defs>' +
            '<linearGradient id="lilyPetal" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-98">' +
            '<stop offset="0" stop-color="#fff3c4"/>' +
            '<stop offset=".12" stop-color="#e91e63"/>' +
            '<stop offset=".55" stop-color="#f48fb1"/>' +
            '<stop offset="1" stop-color="#fff0f5"/>' +
            '</linearGradient>' +
            '<linearGradient id="lilyLeaf" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="-112">' +
            '<stop offset="0" stop-color="#33691e"/>' +
            '<stop offset=".6" stop-color="#689f38"/>' +
            '<stop offset="1" stop-color="#aed581"/>' +
            '</linearGradient>' +
            '</defs>';
        document.body.appendChild(svg);
    }

    function buildPetal(angle, petalDelay) {
        var g = el('g', { 'class': 'petal' });
        g.style.setProperty('--r', angle + 'deg');
        g.style.setProperty('--pd', petalDelay + 's');
        g.appendChild(el('path', { d: PETAL, fill: 'url(#lilyPetal)', stroke: '#f8bbd0', 'stroke-width': '1' }));
        g.appendChild(el('path', { d: 'M0 -10 Q 2 -50 0 -84', stroke: '#c2185b', 'stroke-width': '1.6', fill: 'none', opacity: '.45' }));
        [[5, -24], [-6, -30], [4, -38], [-3, -46], [7, -44]].forEach(function (p) {
            g.appendChild(el('circle', { cx: p[0], cy: p[1], r: '1.8', fill: '#ad1457', opacity: '.75' }));
        });
        return g;
    }

    function buildStamens() {
        var g = el('g', { 'class': 'stamens' });
        for (var i = 0; i < 6; i++) {
            var a = (i * 60 + 30) * Math.PI / 180;
            var x = Math.sin(a) * 44, y = -Math.cos(a) * 44;
            g.appendChild(el('path', { d: 'M0 0 Q ' + (x * 0.4) + ' ' + (y * 0.6) + ' ' + x + ' ' + y, stroke: '#c5e1a5', 'stroke-width': '2', fill: 'none' }));
            g.appendChild(el('ellipse', { cx: x, cy: y, rx: '3', ry: '6', fill: '#8d4a2b', transform: 'rotate(' + (i * 60 + 30) + ' ' + x + ' ' + y + ')' }));
        }
        g.appendChild(el('circle', { r: '7', fill: '#dce775' }));
        return g;
    }

    // Satu bunga lily. Posisi & skala ada di atribut transform pembungkus,
    // sedangkan animasi CSS bekerja di kelopak di dalamnya.
    function buildFlower(f) {
        var g = el('g', { transform: 'translate(' + f.x + ' ' + f.y + ') scale(' + f.scale + ')' });
        g.style.setProperty('--fd', f.delay + 's');
        // Tiga kelopak belakang mekar lebih dulu, lalu tiga kelopak depan.
        [30, 150, 270].forEach(function (a, i) { g.appendChild(buildPetal(a, i * 0.05)); });
        [90, 210, 330].forEach(function (a, i) { g.appendChild(buildPetal(a, 0.2 + i * 0.05)); });
        g.appendChild(buildStamens());
        return g;
    }

    function buildStem(cfg) {
        var wrap = document.createElement('div');
        wrap.className = 'lily' + (cfg.sm ? ' lily-sm' : '');
        wrap.style.setProperty('--x', cfg.x);
        wrap.style.setProperty('--y', cfg.y);
        wrap.style.setProperty('--size', cfg.size);
        wrap.style.setProperty('--tilt', cfg.tilt + 'deg');
        wrap.style.setProperty('--delay', cfg.delay + 's');

        var svg = el('svg', { viewBox: '-160 -210 320 420' });

        STEM_PATHS.forEach(function (d) {
            svg.appendChild(el('path', { 'class': 'stem', d: d, pathLength: '1' }));
        });

        LEAVES.forEach(function (l) {
            var g = el('g', { transform: 'translate(' + l[0] + ' ' + l[1] + ') scale(' + l[3] + ')' });
            var leaf = el('path', { 'class': 'leaf', d: LEAF, fill: 'url(#lilyLeaf)' });
            leaf.style.setProperty('--r', l[2] + 'deg');
            g.appendChild(leaf);
            svg.appendChild(g);
        });

        FLOWERS.forEach(function (f) { svg.appendChild(buildFlower(f)); });

        wrap.appendChild(svg);
        return wrap;
    }

    buildDefs();
    STEMS.forEach(function (cfg) { container.appendChild(buildStem(cfg)); });
})();
