import { readFile } from 'node:fs/promises';

// Compare the established design using the original copy. Content snapshots and
// responsive layout tests exercise the unmodified, current CV content separately.
export async function restoreOriginalCopy(page, name) {
  const html = await readFile(`.tools/visual-reference/${name}.html`, 'utf8');
  await page.evaluate(({ html, name }) => {
    const original = new DOMParser().parseFromString(html, 'text/html');
    const structure = node => [...node.querySelectorAll('*')].map(child => ({
      tag: child.tagName,
      attrs: [...child.attributes].filter(attr => attr.name !== 'href').map(attr => [attr.name, attr.value])
    }));
    function restore(selector, markup = false, expectedTags) {
      const current = [...document.querySelectorAll(selector)];
      const reference = [...original.querySelectorAll(selector)];
      if (!current.length || current.length !== reference.length) {
        throw new Error(`Copy comparison selector changed: ${selector}`);
      }
      current.forEach((node, index) => {
        if (node.tagName !== reference[index].tagName || node.className !== reference[index].className) {
          throw new Error(`Copy comparison element changed: ${selector}`);
        }
        if (markup) {
          const expected = expectedTags
            ? expectedTags.map(tag => ({ tag, attrs: [] }))
            : structure(reference[index]);
          if (JSON.stringify(structure(node)) !== JSON.stringify(expected)) {
            throw new Error(`Copy comparison child structure changed: ${selector}`);
          }
          node.innerHTML = reference[index].innerHTML;
        } else {
          if (node.childElementCount || reference[index].childElementCount) {
            throw new Error(`Expected a plain text block: ${selector}`);
          }
          node.textContent = reference[index].textContent;
        }
      });
    }

    restore('.ticker-seq > span:nth-child(-n+2)', true);

    if (name === 'index') {
      restore('.typing-text');
      restore('.hero-subtitle');
      restore('.brief-body > p');
      restore('.module-card:nth-child(-n+2) .module-desc');
    }

    if (name === 'resume') {
      restore('.resume-tagline');
      restore('#summary > p');
      restore('#skills .resume-skills-table th');
      restore('#skills .resume-skills-table td');
      for (const [index, count] of [5, 1, 1].entries()) {
        restore(`#experience > .resume-entry:nth-of-type(${index + 1}) .resume-bullets`, true, Array(count).fill('LI'));
      }
      // These two CV projects are additions to the original three-entry list.
      for (const title of ['Cortex XDR IOC Uploader', 'PE Malware Analysis Toolkit']) {
        const entries = [...document.querySelectorAll('#achievements > .resume-entry')]
          .filter(entry => entry.querySelector('h4')?.textContent === title);
        if (entries.length !== 1) throw new Error(`Expected one added CV project: ${title}`);
        entries[0].remove();
      }
      for (const index of [2, 3]) {
        const selector = `#achievements > .resume-entry:nth-of-type(${index}) .resume-entry-header`;
        const header = document.querySelector(selector);
        if (header.children.length !== 1) throw new Error('Expected the CV project header without an inferred date');
        restore(`${selector} > h4`);
        const originalDate = original.querySelector(`${selector} > .resume-entry-meta`);
        header.append(document.createTextNode(' '), originalDate.cloneNode(true));
      }
      restore('#achievements > .resume-entry:nth-of-type(2) > p', true, ['A', 'A']);
      restore('#achievements > .resume-entry:nth-of-type(3) > p');
      restore('#certifications > h3');
      restore('#certifications > .resume-bullets', true, ['LI', 'STRONG', 'LI', 'STRONG', 'LI', 'STRONG', 'A']);
    }

    if (name === 'certifications') {
      restore('.cert-card:nth-child(1) .cert-issuer');
      // Preserve the candidate's credential-code elements and card structure.
      for (const selector of ['.cert-card:nth-child(1) .cert-rows > li']) {
        const current = [...document.querySelectorAll(selector)];
        const reference = [...original.querySelectorAll(selector)];
        if (current.length !== 2 || reference.length !== 2) throw new Error('Cortex credential rows changed');
        current.forEach((node, index) => {
          if (node.firstChild.nodeType !== Node.TEXT_NODE) throw new Error('Credential label structure changed');
          node.firstChild.textContent = reference[index].firstChild.textContent;
        });
      }
      restore('.cert-card:nth-child(3) h3');
      restore('.cert-card:nth-child(3) .cert-issuer');
      restore('.cert-card:nth-child(4) .cert-issuer');
      restore('.cert-rank-context', true);
    }
  }, { html, name });
}
