## Development

Start the dev server with:

```
npm run dev
```

`astro dev` does not have a `--background` flag, and there is no `astro dev stop` / `status` / `logs` — those were incorrect and have been removed from this file. Astro's dev server runs in the foreground; the terminal it's running in shows hotkeys (`o + enter` to open in browser, `q + enter` to quit).

To actually run it in the background, that's a shell-level thing, not an Astro thing:

- Git Bash / WSL: `astro dev > astro-dev.log 2>&1 &` (background it with `&`; check with `jobs`; stop with `kill %1`)
- PowerShell: `Start-Process npm -ArgumentList "run","dev" -NoNewWindow`
- Or just run it in a separate terminal tab/window — simplest option when actively developing.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
