import ReactMarkdown from "react-markdown";

type MarkdownComponentProps = {
    text: string;
};

export function MarkdownComponent({ text }: MarkdownComponentProps) {
    return (
        <ReactMarkdown
            className="max-h-[55vh]"
            components={{
                h1: ({ node, ...props }) => (
                    <h1 className=" pt-4 text-2xl font-bold" {...props} />
                ),
                h2: ({ node, ...props }) => (
                    <h2 className=" pt-3 text-xl font-bold" {...props} />
                ),
                h3: ({ node, ...props }) => (
                    <h3 className=" pt-2 text-lg font-bold" {...props} />
                ),
                h4: ({ node, ...props }) => (
                    <h4 className=" pt-1 text-lg font-bold" {...props} />
                ),
                h5: ({ node, ...props }) => (
                    <h4 className=" pt-0 text-base font-bold" {...props} />
                ),
                h6: ({ node, ...props }) => (
                    <h6 className=" pt-0 text-base font-bold" {...props} />
                ),
            }}
        >
            {text}
        </ReactMarkdown>
    );
}
