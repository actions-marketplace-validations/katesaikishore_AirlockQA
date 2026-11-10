// QAFind Marketing Site - Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('.al');
  if (!root) return;

  // 1. Plain vs Technical Mode Switcher
  function setMode(mode) {
    if (mode === 'tech') {
      root.classList.remove('al-mode-plain');
      root.classList.add('al-mode-tech');
      document.querySelectorAll('[data-mode-btn="plain"]').forEach(btn => btn.setAttribute('aria-pressed', 'false'));
      document.querySelectorAll('[data-mode-btn="tech"]').forEach(btn => btn.setAttribute('aria-pressed', 'true'));
    } else {
      root.classList.remove('al-mode-tech');
      root.classList.add('al-mode-plain');
      document.querySelectorAll('[data-mode-btn="plain"]').forEach(btn => btn.setAttribute('aria-pressed', 'true'));
      document.querySelectorAll('[data-mode-btn="tech"]').forEach(btn => btn.setAttribute('aria-pressed', 'false'));
    }
  }

  document.querySelectorAll('[data-mode-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode-btn');
      setMode(mode);
    });
  });

  // 2. Code Tabs Switcher (cli, cfg, ci)
  function setTab(tab) {
    root.setAttribute('data-tab', tab);
    document.querySelectorAll('[data-tab-target]').forEach(btn => {
      const active = btn.getAttribute('data-tab-target') === tab;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab-target');
      setTab(tab);
    });
  });

  // 3. FAQ Accordion
  document.querySelectorAll('.al-faq-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.al-faq-item');
      if (!item) return;
      const body = item.querySelector('.al-faq-body');
      const isOpen = item.classList.contains('is-open');

      if (isOpen) {
        item.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        if (body) body.hidden = true;
      } else {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        if (body) body.hidden = false;
      }
    });
  });

  // 4. Copy to Clipboard
  document.querySelectorAll('[data-copy-target]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy-target') || 'npm install --save-dev qafind';
      try {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(textToCopy);
        } else {
          throw new Error('Clipboard API not available');
        }
      } catch {
        const ta = document.createElement('textarea');
        ta.value = textToCopy;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const label = btn.querySelector('.al-copy-label') || btn;
      const originalText = label.textContent;
      label.textContent = 'Copied!';
      btn.classList.add('is-copied');
      setTimeout(() => {
        label.textContent = originalText;
        btn.classList.remove('is-copied');
      }, 1600);
    });
  });

  // 5. Smooth Scroll for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

