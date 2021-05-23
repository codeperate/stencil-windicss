import { Processor } from 'windicss/lib';
import { CSSParser } from 'windicss/utils/parser';
import {Plugin} from '@stencil/core/internal';
export function windicss():Plugin {
    return {
        name: 'windicss',
        pluginType: 'css',
        transform(sourceText:string) {
            const processor = new Processor();
            const styleSheets = new CSSParser(sourceText, processor).parse();
            return { code: styleSheets.build() };
        }
    }
}