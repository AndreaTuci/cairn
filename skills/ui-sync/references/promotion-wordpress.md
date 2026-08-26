# Promotion — WordPress target

The only case where components genuinely do not travel: `.astro` becomes PHP. What travels is the
markup and the tokens, and the translation stays mechanical as long as the prototype stayed plain.

## What moves as-is

| From the workbench | To the theme |
|---|---|
| The compiled token stylesheet | `assets/theme.css`, enqueued once |
| The markup inside each component | the body of a template part or a block's `render.php` |
| The classes on every element | unchanged, verbatim |

Nothing else. Frontmatter, props and imports have no counterpart.

## The translation, line by line

```astro
<article class="rounded-lg border bg-card p-6 shadow-card">
  <h3 class="text-lg font-semibold">{article.title}</h3>
  <p class="mt-2 text-sm text-muted-foreground">{article.excerpt}</p>
</article>
```

```php
<article class="rounded-lg border bg-card p-6 shadow-card">
  <h3 class="text-lg font-semibold"><?php echo esc_html( $title ); ?></h3>
  <p class="mt-2 text-sm text-muted-foreground"><?php echo esc_html( $excerpt ); ?></p>
</article>
```

The classes are identical, character for character. If you find yourself rewriting them, either
the prototype was too clever or the theme is not on the same token file — fix that rather than
translating twice.

**Escape everything, at the point of output**: `esc_html` for text, `esc_url` for links,
`esc_attr` for attributes, `wp_kses_post` for editor content. The prototype has no security model;
the theme does, and this is not a later pass.

## Tokens

The workbench's Tailwind build produces plain CSS custom properties. Enqueue that stylesheet and
every token is reachable from PHP, from block markup and from the editor with no build step:

```php
wp_enqueue_style( 'theme-tokens', get_theme_file_uri( '/assets/theme.css' ), [], THEME_VERSION );
```

**Block themes**: `theme.json` also carries palette and type presets, and those must be generated
from the same tokens rather than typed in a second time. Two sources for one palette is the exact
failure the token layer exists to prevent, and the editor is where it shows first.

## Blocks

A block is what the client actually edits, so the component boundaries in the prototype should
line up with the blocks they will be given. If a screen arrived as one indivisible piece and the
client expects to edit parts of it, that is a design question, not an implementation detail —
raise it before writing `block.json`.

Every `block.json` attribute is something the design decided is editable. Anything the prototype
hardcoded that the client will want to change is a gap: list it in the handoff's open questions.

## The triage, before anything moves

| | When |
|---|---|
| **Keep** | the markup is plain and ports verbatim |
| **Normalize** | the markup got clever in the prototype — flatten it first, in the workbench, so the designer keeps a source that matches production |
| **Rewrite** | the screen depends on client-side behaviour the theme will not have |

Normalizing **in the workbench rather than in the theme** is the part people skip, and it is what
keeps the designer's copy true. A prototype that no longer resembles what shipped stops being
consulted, and then it stops being maintained.

## Record it

```bash
node design/.ui/ui-drift.mjs --root design \
  --record src/components/ArticleCard.astro \
  --to wp-content/themes/<theme>/blocks/article-card/render.php
```
