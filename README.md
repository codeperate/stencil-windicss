# stencil-windicss

This is a stencil plugin for you to use windicss in your stencil project.

## Important

- Currently does not support attribute mode, compile mode, pre-flight and prefix.
- Only .js config file is supported.
- This project is still in development. Take your own risk on production usage.

## Install

```bash
npm i @codeperate/stencil-windicss -D
```

```ts
// stencil.config.ts
import { windicssStencil } from '@codeperate/stencil-windicss';

export const config: Config = {
	plugins: [...windicssStencil({ configFile: 'windi.config.js', out: 'windi.css' })],
};
```

In your html

```html
<link href="/build/windi.css" rel="stylesheet" />
```
