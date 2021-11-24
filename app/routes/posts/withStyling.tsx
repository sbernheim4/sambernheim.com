import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// @ts-ignore
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism/';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ReactDOMServer from 'react-dom/server';



export const withStyling = (markdown: string) => {
	// const { default: ReactMarkdown } = await import('react-markdown');
	// const { default: remarkGfm } = await import('remark-gfm');
	// const {default: rehypeRaw } = await import ('rehype-raw');

	return ReactDOMServer.renderToStaticMarkup(
		<div>
			{markdown}
			{/* <ReactMarkdown
				rehypePlugins={[rehypeRaw]}
				remarkPlugins={[remarkGfm]}
				children={markdown}
				components={{
					code({ node, inline, className, children, ...props }) {
						return inline ?
							(
								// @ts-ingore
								<SyntaxHighlighter
									useInlineStyles={false}
									children={String(children).replace(/\n$/, '')}
									language={"typescript"}
									PreTag="span"
									// @ts-ingore
									{...props}
								/>
							) :
							(
								<SyntaxHighlighter
									children={String(children).replace(/\n$/, '')}
									style={vscDarkPlus}
									language={"typescript"}
									PreTag="div"
									{...props}
								/>
							)
					}
				}}
			/> */}
			hi
		</div>
	)
};