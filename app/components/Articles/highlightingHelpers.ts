import { Remarkable } from 'remarkable';
import hljs from 'highlight.js';

export const md = new Remarkable({
	langPrefix: 'hljs language-',
	highlight: function (str: string, lang: string) {

		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (err) { }
		}

		try {
			return hljs.highlightAuto(str).value;
		} catch (err) { }

		return '';
	}
});