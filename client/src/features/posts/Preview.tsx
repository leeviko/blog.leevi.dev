import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkEmoji from "remark-emoji";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { gruvboxDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import Tag from "../../components/Tag";

type Props = {
  post: any;
  tags: Array<string>;
};

const Preview = ({ post, tags }: Props) => {
  return (
    <div className="preview">
      <article className="post-container">
        <div className="post">
          <div className="post-wrapper">
            <h1 className="post-title p-title">{post.title}</h1>
            <ul className="post-tags p-tags">
              {tags.map((tag: any) => (
                <Tag key={tag} name={tag} postType="full" />
              ))}
            </ul>
            <div className="post-content">
              <ReactMarkdown
                children={post.content}
                remarkPlugins={[remarkGfm, remarkEmoji]}
                className="markdown-body"
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, "")}
                        // @ts-ignore
                        style={gruvboxDark}
                        language={match[1]}
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Preview;
