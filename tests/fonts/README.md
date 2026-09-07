These fonts are test fixtures only; the production site keeps its existing font configuration.

- JetBrains Mono: captured from the existing Google Fonts URL on 2026-09-07; SIL Open Font License in `JetBrainsMono-OFL.txt`. Source: https://github.com/JetBrains/JetBrainsMono.
- GNU FreeSans: the original local reference environment's sans-serif fallback, release 20120503. GPLv3 with the font embedding exception in `FreeSans-LICENSE.txt`. Corresponding source: https://ftp.gnu.org/gnu/freefont/freefont-src-20120503.tar.gz.

The dedicated fontconfig file prevents host-specific font substitutions in screenshots. Update fixtures and baselines together only when intentionally changing the visual reference environment.
