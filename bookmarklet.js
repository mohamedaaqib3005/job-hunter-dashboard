javascript: (async () => {
  const platform = location.hostname;

  const text =
    `Platform: ${platform}
Title: ${document.title}
URL: ${location.href}
Status: Saved`;

  await navigator.clipboard.writeText(text);

  alert("Job Saved");
})();