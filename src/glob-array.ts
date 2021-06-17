import glob from 'glob';
import minimatch from 'minimatch';

export function globArray(patterns: string[], options?: glob.IOptions): string[] {
	const list: string[] = [];

	patterns.forEach((pattern) => {
		if (pattern[0] === '!') {
			let i = list.length - 1;
			while (i > -1) {
				if (!minimatch(list[i], pattern)) {
					list.splice(i, 1);
				}
				i--;
			}
		} else {
			const newList = glob.sync(pattern, options);
			newList.forEach((item) => {
				if (list.indexOf(item) === -1) {
					list.push(item);
				}
			});
		}
	});

	return list;
}
