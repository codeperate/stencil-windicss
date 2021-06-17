import { ClassName } from 'windicss/types/utils/parser/html';
import { CSSParser } from 'windicss/utils/parser';
import { StyleSheet } from 'windicss/utils/style';
import { extname, resolve } from 'path';
import { Extractor } from 'windicss/types/interfaces';
import { Processor } from './processor';
import { globArray } from './glob-array';
import { readFileSync } from 'fs';
export let styleSheets: { [key: string]: StyleSheet } = {};
export let preflights: { [key: string]: StyleSheet } = {};
export function JSXParser(str: string) {
	if (!str) return [];
	const output: ClassName[] = [];
	const regex = /class?\s*:\s*`[^`]+`|class?\s*:\s*"[^"]+"|class?\s*:\s*'[^']+'/gim;
	let match;
	while ((match = regex.exec(str as string))) {
		if (match) {
			const raw = match[0];
			const sep = raw.indexOf(':');
			let value = raw.slice(sep + 1).trim();
			let start = match.index + sep + 2;
			let end = regex.lastIndex;
			let first = value.charAt(0);
			while (['"', "'", '`', '{'].includes(first)) {
				value = value.slice(1, -1);
				first = value.charAt(0);
				end--;
				start++;
			}
			output.push({
				result: value,
				start,
				end,
			});
		}
	}

	return output;
}
export interface StencilWindicssConfig {
	configFile?: string;
	out?: string;
	preflight?: boolean;
}
export function windicssStencil(config?: StencilWindicssConfig): any[] {
	const _config: StencilWindicssConfig = {
		configFile: resolve('windi.config.js'),
		out: 'windi.css',
		preflight: false,
		...config,
	};
	const processor = new Processor(require(_config.configFile));
	const safelist = processor.config('safelist');
	function buildSafeList(safelist: unknown) {
		if (safelist) {
			let classes: string[] = [];
			if (typeof safelist === 'string') {
				classes = safelist.split(/\s/).filter((i) => i);
			}
			if (Array.isArray(safelist)) {
				for (const item of safelist) {
					if (typeof item === 'string') {
						classes.push(item);
					} else if (Array.isArray(item)) {
						classes = classes.concat(item);
					}
				}
			}
			styleSheets['safelist'] = processor.interpret(classes.join(' ')).styleSheet;
		}
	}
	function interpret(files: string[]) {
		files.forEach((file) => {
			const content = readFileSync(file).toString();
			let outputStyle = [];
			JSXParser(content).forEach((p) => {
				const utility = processor.interpret(p.result, false);
				styleSheets[file] = styleSheets[file] ? styleSheets[file].extend(utility.styleSheet) : utility.styleSheet;
				outputStyle.push(utility.styleSheet);
			});
			const extractors = processor.config('extract.extractors') as Extractor[] | undefined;
			if (extractors) {
				for (const { extractor, extensions } of extractors) {
					if (extensions.includes(extname(file).slice(1))) {
						const result = extractor(content);
						if ('classes' in result && result.classes) {
							const utility = processor.interpret(result.classes.join(' '), false);
							styleSheets[file] = styleSheets[file] ? styleSheets[file].extend(utility.styleSheet) : utility.styleSheet;
							outputStyle.push(utility.styleSheet);
						}
					}
				}
			}
		});
	}
	buildSafeList(safelist);
	const patterns = [].concat(processor.config('extract.include', []) as string[]).concat((processor.config('extract.exclude', []) as string[]).map((i) => '!' + i));
	let matchFiles = globArray(patterns);
	interpret(matchFiles);
	return [
		{
			name: 'windicss-jsx-transpiler',
			transform(sourceText: string, filename: string) {
				if (filename.indexOf('.tsx') != -1) {
					let outputHTML = [],
						outputStyle = [],
						indexStart = 0;
					JSXParser(sourceText).forEach((p) => {
						outputHTML.push(sourceText.substring(indexStart, p.start));
						const utility = processor.interpret(p.result, false);
						styleSheets[filename] = styleSheets[filename] ? styleSheets[filename].extend(utility.styleSheet) : utility.styleSheet; // Set third argument to false to hide comments;
						outputStyle.push(utility.styleSheet);
						outputHTML.push([...utility.success, ...utility.ignored].join(' '));
						indexStart = p.end;
					});
					const extractors = processor.config('extract.extractors') as Extractor[] | undefined;
					if (extractors) {
						for (const { extractor, extensions } of extractors) {
							if (extensions.includes(extname(filename).slice(1))) {
								const result = extractor(sourceText);
								if ('classes' in result && result.classes) {
									const utility = processor.interpret(result.classes.join(' '), false);
									styleSheets[filename] = styleSheets[filename] ? styleSheets[filename].extend(utility.styleSheet) : utility.styleSheet;
									outputStyle.push(utility.styleSheet);
								}
							}
						}
					}
					outputHTML.push(sourceText.substring(indexStart));
					if (_config.preflight) {
						const preflight = processor.preflight(sourceText, true, true, true);
						preflights[filename] = preflights[filename] ? preflights[filename].extend(preflight) : preflight;
					}
					return { code: outputHTML.join('') };
				}
				return { code: sourceText };
			},
			generateBundle() {
				let outputStyle = Object.values(styleSheets)
					.reduce((previousValue: StyleSheet, currentValue: StyleSheet) => previousValue.extend(currentValue), new StyleSheet())
					.sort()
					.combine();
				if (_config.preflight)
					outputStyle = Object.values(preflights)
						.reduce((previousValue: StyleSheet, currentValue: StyleSheet) => previousValue.extend(currentValue), new StyleSheet())
						.sort()
						.combine()
						.extend(outputStyle);
				this.emitFile({ type: 'asset', fileName: _config.out, source: outputStyle.build() });
			},
		},
		{
			name: 'windicss-css-transpiler',
			pluginType: 'css',
			transform(sourceText: string) {
				const styleSheets = new CSSParser(sourceText, processor).parse();
				return { code: styleSheets.build() };
			},
		},
	];
}
