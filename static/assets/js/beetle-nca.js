// Page-local controls and charts. Measurements come from the recorded evaluation.
(() => {
    'use strict';
    const root = document.querySelector('.nca-case-study');
    if (!root) return;

    const descriptions = {
        grown: ['The learned beetle after 384 recurrent updates', 'Grown from a single seed', '384 updates · seed 30012', 'Learned state'],
        target: ['The prepared training target with crisp red circuitry', 'The prepared training target', '62 × 64 artwork · 96 × 96 grid', 'Training target']
    };
    const stateButtons = [...root.querySelectorAll('[data-nca-state]')];
    stateButtons.forEach(button => button.addEventListener('click', () => {
        const [alt, caption, detail, label] = descriptions[button.dataset.ncaState];
        const image = root.querySelector('#nca-specimen-image');
        image.src = button.dataset.src;
        image.alt = alt;
        root.querySelector('#nca-state-caption').textContent = caption;
        root.querySelector('#nca-state-detail').textContent = detail;
        root.querySelector('#nca-state-label').textContent = label;
        stateButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }));

    const tabs = [...root.querySelectorAll('[role="tab"]')];
    function selectTab(selected, focus = false) {
        tabs.forEach(tab => {
            const active = tab === selected;
            const panel = document.getElementById(tab.getAttribute('aria-controls'));
            tab.setAttribute('aria-selected', String(active));
            tab.tabIndex = active ? 0 : -1;
            panel.hidden = !active;
            if (!active) panel.querySelector('video').pause();
        });
        if (focus) selected.focus();
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', event => {
            const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
            if (next !== undefined) { event.preventDefault(); selectTab(tabs[next], true); }
        });
    });

    root.querySelector('#nca-copy').addEventListener('click', async event => {
        const button = event.currentTarget;
        const code = root.querySelector('#nca-command');
        const status = root.querySelector('#nca-copy-status');
        try {
            await navigator.clipboard.writeText(code.textContent.trim());
            button.textContent = 'Copied';
            status.textContent = 'Evaluation command copied to clipboard.';
            setTimeout(() => { button.textContent = 'Copy'; }, 2000);
        } catch {
            const range = document.createRange();
            range.selectNodeContents(code);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            button.textContent = 'Select & copy';
            status.textContent = 'The command is selected. Use your keyboard to copy it.';
        }
    });

    const data = window.NCA_DATA;
    if (!data) return;
    const tokens = getComputedStyle(document.documentElement);
    const color = name => tokens.getPropertyValue(name).trim();
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 500 155');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', 'nca-growth-chart-title');
    function draw(tag, attributes, text) {
        const node = document.createElementNS(ns, tag);
        Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, String(value)));
        if (text !== undefined) node.textContent = text;
        svg.append(node);
        return node;
    }
    draw('title', { id: 'nca-growth-chart-title' }, `All 16 growth trials exceed the 0.80 IoU threshold. Values range from ${Math.min(...data.growth).toFixed(4)} to ${Math.max(...data.growth).toFixed(4)}.`);
    const y = value => 123 - ((value - 0.75) / 0.15) * 108;
    [0.75, 0.80, 0.85, 0.90].forEach(value => {
        draw('line', { x1: 40, x2: 492, y1: y(value), y2: y(value), stroke: color(value === 0.8 ? '--text-dim' : '--line'), 'stroke-dasharray': value === 0.8 ? '4 4' : '0' });
        draw('text', { x: 0, y: y(value) + 4, fill: color('--text-dim'), 'font-family': 'monospace', 'font-size': 12 }, value.toFixed(2));
    });
    data.growth.forEach((value, index) => {
        const x = 54 + index * 28.4;
        draw('line', { x1: x, x2: x, y1: y(0.8), y2: y(value), stroke: color('--accent'), 'stroke-opacity': 0.4, 'stroke-width': 2 });
        const dot = draw('circle', { cx: x, cy: y(value), r: 4, fill: color('--accent') });
        const title = document.createElementNS(ns, 'title');
        title.textContent = `Seed ${data.baseSeed + index}: IoU ${value.toFixed(4)}`;
        dot.append(title);
        draw('text', { x, y: 148, 'text-anchor': 'middle', fill: color('--text-dim'), 'font-family': 'monospace', 'font-size': 12 }, String(index + 1).padStart(2, '0'));
    });
    root.querySelector('#nca-growth-chart').append(svg);

    ['circle', 'rectangle'].forEach(kind => {
        const cases = data.repair.filter(item => item.kind === kind);
        const row = document.createElement('div');
        const label = document.createElement('div');
        label.className = 'nca-repair-label';
        const name = document.createElement('span');
        name.textContent = kind === 'circle' ? 'Circular damage' : 'Rectangular damage';
        const count = document.createElement('span');
        count.textContent = `${cases.filter(item => item.success).length} / ${cases.length}`;
        label.append(name, count);
        const cells = document.createElement('div');
        cells.className = 'nca-repair-cells';
        cases.forEach(item => {
            const cell = document.createElement('span');
            cell.className = `nca-repair-cell${item.success ? '' : ' is-failed'}`;
            cell.setAttribute('role', 'img');
            cell.title = `Seed ${item.seed}: ${item.success ? 'recovered' : 'below target'}, ${(item.relative_recovery * 100).toFixed(1)}% of pre-damage IoU`;
            cell.setAttribute('aria-label', cell.title);
            cells.append(cell);
        });
        row.append(label, cells);
        root.querySelector('#nca-repair-chart').append(row);
    });
})();
