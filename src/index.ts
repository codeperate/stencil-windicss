import { Processor } from 'windicss/lib';
import { CSSParser } from 'windicss/utils/parser';
import { Plugin } from '@stencil/core/internal';
import { ClassName } from 'windicss/types/utils/parser/html';
import { StyleSheet } from 'windicss/utils/style';
import { writeFile } from 'fs';
export let styleSheets: { [key: string]: StyleSheet } = {};
export function JSXParser(str: string) {
	if (!str) return [];
	const output: ClassName[] = [];
	const regex = /class?\s*:\s*`[^]+`|class?\s*:\s*"[^"]+"|class?\s*:\s*'[^']+'|class?\s*:\s*[^>\s]+/gim;
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
export function windicssStencil(): Plugin[] {
	return [
		{
			name: 'windicss-jsx-transpiler',
			transform(sourceText: string, filename: string) {
				if (filename.indexOf('.tsx') != -1) {
					let processor = new Processor();
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
					outputHTML.push(sourceText.substring(indexStart));
					const added = outputStyle.reduce((previousValue: StyleSheet, currentValue: StyleSheet) => previousValue.extend(currentValue), new StyleSheet());
					styleSheets[filename] = styleSheets[filename] ? styleSheets[filename].extend(added) : added;
					return { code: outputHTML.join('') };
				}
				return { code: sourceText };
			},
		},
		{
			name: 'windicss-css-transpiler',
			pluginType: 'css',
			transform(sourceText: string) {
				const processor = new Processor();
				const styleSheets = new CSSParser(sourceText, processor).parse();
				return { code: styleSheets.build() };
			},
		},
	];
}
export interface RollupWindicssConfig {
	out: string;
}
export function windicssRollup(config?: RollupWindicssConfig): any {
	const _config: RollupWindicssConfig = {
		out: 'src/global/windi.css',
		...config,
	};
	let transformed = false;
	function build() {
		let outputStyle = Object.values(styleSheets)
			.reduce((previousValue: StyleSheet, currentValue: StyleSheet) => previousValue.extend(currentValue), new StyleSheet())
			.sort()
			.combine();
		writeFile(_config.out, outputStyle.build(), () => null);
	}
	return {
		name: 'windicss-rollup',
		transform() {
			transformed = true;
		},
		generateBundle() {
			if (transformed) {
				build();
				transformed = false;
			}
		},
	};
}