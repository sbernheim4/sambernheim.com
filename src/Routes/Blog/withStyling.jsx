import React from 'react';
import ReactMarkdown from 'react-markdown'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism/';

import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

export const withStyling = (markdown) => () => {
	return (
        <ReactMarkdown
		    rehypePlugins={[rehypeRaw]}
		    remarkPlugins={[remarkGfm]}
		    children={markdown}
		    components={{
		    	code({node, inline, className, children, ...props}) {
		    		return inline ?
		    			(
		    				<SyntaxHighlighter
		    					useInlineStyles={false}
		    					children={String(children).replace(/\n$/, '')}
		    					language={"typescript"}
		    					PreTag="span"
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
	    />
    )
};
