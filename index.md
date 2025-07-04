---
layout: page
title: "Hi, I'm Joshua"
subtitle: "Pythonic / Backend Developer / Coffee Enthusiast"
---

<div class="snippet-clipboard-content notranslate position-relative overflow-auto">
  <pre lang="text" class="notranslate">
    <code>{% include progress.txt %}</code></pre>
  <div class="zeroclipboard-container">
    <clipboard-copy aria-label="Copy"
      class="ClipboardButton btn btn-invisible js-clipboard-copy m-2 p-0 d-flex flex-justify-center flex-items-center"
      data-copy-feedback="Copied!" data-tooltip-direction="w" value="{% include progress.txt %}" tabindex="0" role="button">
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"
        class="octicon octicon-copy js-clipboard-copy-icon">
        <path
          d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z">
        </path>
        <path
          d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z">
        </path>
      </svg>
      <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"
        class="octicon octicon-check js-clipboard-check-icon color-fg-success d-none">
        <path
          d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z">
        </path>
      </svg>
    </clipboard-copy>
  </div>
</div>

> People don't change unless they undergo a significant amount of self-reflection or are forced to by circumstances.

{: .box-error}
**Warning:** Automating tasks may lead to a uncontrollable urge to automate everything.

<script>
document.addEventListener("DOMContentLoaded", function() {
  const copyButtons = document.querySelectorAll('.js-clipboard-copy');

  copyButtons.forEach(button => {
    button.addEventListener('click', () => {
      const text = button.getAttribute('value');
      navigator.clipboard.writeText(text).then(() => {
        const icon = button.querySelector('.js-clipboard-copy-icon');
        const check = button.querySelector('.js-clipboard-check-icon');
        if (icon && check) {
          icon.classList.add('d-none');
          check.classList.remove('d-none');
          setTimeout(() => {
            icon.classList.remove('d-none');
            check.classList.add('d-none');
          }, 2000); // Reset after 2s
        }
      });
    });
  });
});
</script>