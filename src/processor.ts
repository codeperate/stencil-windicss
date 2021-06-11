import { Processor as WindiProcessor } from 'windicss/lib';
import { hash } from 'windicss/utils'
import preflight from './preflight';
import { StyleSheet } from 'windicss/utils/style';
export class Processor extends WindiProcessor {
    constructor(config) {
        super(config)
    }
    preflight(
        html?: string,
        includeBase = true,
        includeGlobal = true,
        includePlugins = true,
        ignoreProcessed = false
    ): StyleSheet {
        let id;
        if (html) {
            id = hash(html);
            if (ignoreProcessed && this["_cache"].html.includes(id)) return new StyleSheet();
        }
        id && ignoreProcessed && this["_cache"].html.push(id);
        return preflight(this, html, includeBase, includeGlobal, includePlugins);
    }
}