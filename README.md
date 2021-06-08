# stencil-windicss
This is a stencil plugin for you to use windicss in your stencil project.
## Important

- Currently does not support attribute mode, compile mode and prefix.
- This project is still in development. Take your own risk on production usage.

## Install

```bash
npm i @codeperate/stencil-windicss -D
```

```ts
// stencil.config.ts
import { windicssStencil, windicssRollup } from '@codeperate/stencil-windicss'

export const config: Config = {
    plugins: [
        ...windicssStencil()
    ],
    rollupPlugins: {
		after: [windicssRollup({
            out: "src/global/windi.css", //These are the default values.
            preflight: true
        })],
    },
};
```