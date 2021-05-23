# stencil-windicss

This is a stencil plugin for ONLY transforming windicss directives in your css file. If you need On-demand CSS utilities,
just use [rollup-plugin-windicss](https://github.com/windicss/vite-plugin-windicss/tree/main/packages/rollup-plugin-windicss)
and [rollup-plugin-postcss](https://github.com/egoist/rollup-plugin-postcss) like below:
```
//stencil.config.ts
export const config: Config = {
    ...
    rollupPlugins: {
        after: [...WindiCSS({ transformCSS: false }), postcss()],
    },
    ...
}

```