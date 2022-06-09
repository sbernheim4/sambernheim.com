import { LinksFunction } from "@remix-run/cloudflare";
import articleStyles from './../../styles/article.css'

export const links: LinksFunction = () => {
	return [
		{ rel: 'stylesheet', href: articleStyles }
	]
};

export default (props) => {
	return props.children;

};
