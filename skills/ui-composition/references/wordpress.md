# WordPress

Read this when the target stack is WordPress. The designer still prototypes in the Astro
workbench; this file is about what makes that prototype port cleanly into PHP and blocks, and
what makes it painful.

## The tokens travel; the components do not

Tailwind v4 compiles `@theme` to plain CSS custom properties. That compiled stylesheet is
enqueued by the theme, and every token is then reachable from PHP, from block markup, and from
the editor — with no build step in between.

```php
wp_enqueue_style( 'theme-tokens', get_theme_file_uri( '/assets/theme.css' ), [], THEME_VERSION );
```

So one token file drives the prototype and the WordPress site alike. The components do not
travel: `.astro` files become PHP templates or block `render.php`. That translation is mechanical
as long as the markup stays plain, which is what the rest of this file is about.

## Write markup that ports

The port is a copy of the markup with the data swapped. Anything that makes the markup clever
makes the port manual.

| Do | Avoid |
|---|---|
| `<span class="text-sm text-muted-foreground">{article.date}</span>` | class strings assembled by a function call inside the template |
| One element, one purpose, classes written out | conditional class expressions three levels deep |
| `<article>`, `<nav>`, `<h2>` — real semantic tags | `<div>` towers that rely on the framework to mean something |
| Structure that reads top to bottom | structure that only makes sense once you know the props |

Where the workbench would let you be clever, do not be. The prototype's job here is to be
transcribed.

## Blocks

A block is the unit a WordPress editor actually manipulates, so the component boundaries in the
prototype should line up with the blocks the client will edit. Decide that boundary while
designing, not after: a beautiful screen that is one indivisible block is a screen the client
cannot use.

```
blocks/article-card/
├── block.json      ← name, attributes, supports
├── render.php      ← the markup, ported from the prototype
├── edit.jsx        ← the editor view
└── style.css       ← only if a token cannot express it, which is rare
```

Every attribute in `block.json` corresponds to something the design decided is editable. If the
prototype hardcoded it and the client will want to change it, that is a gap to raise now.

## Escaping, every time

The prototype has no security model; the port does. Every dynamic value is escaped at the point
of output, by the function that matches its position:

```php
<h2 class="text-lg font-semibold"><?php echo esc_html( $title ); ?></h2>
<a href="<?php echo esc_url( $permalink ); ?>" class="text-primary">
  <?php echo esc_html( $label ); ?>
</a>
<div class="prose"><?php echo wp_kses_post( $content ); ?></div>
```

`esc_html` for text, `esc_url` for links, `esc_attr` for attributes, `wp_kses_post` for editor
content. This is not optional and it is not a later pass.

## The four states in WordPress

- **Empty** — the loop with no posts. `if ( ! have_posts() )` is one line and it is the state
  clients see most often on a fresh site.
- **Loading** — usually not applicable server-side. Say so in the handoff rather than leaving the
  question unanswered.
- **Error** — a missing image, a broken relation, a deleted term. Design what the card looks like
  when the featured image is gone, because eventually it is.

## What the designer should ask before starting

Two questions, answered by a developer, that change the whole shape of the prototype:

1. **Which parts will the client edit?** That decides the block boundaries.
2. **Classic theme or block theme?** A block theme means `theme.json` also carries palette and
   type presets, and those must be generated from the same tokens rather than typed in twice.
