import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useChat } from "../../hooks/use-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput, { ChatInputHandle } from "./ChatInput";
import { Loader2 } from "lucide-react";
import type { Message } from "@db/schema";
import ReactMarkdown from "react-markdown";

interface ChatThreadProps {
  threadId: number | null;
  onThreadCreated: (id: number) => void;
}

export default function ChatThread({ threadId, onThreadCreated }: ChatThreadProps) {
  const { getMessages, createThread, sendMessage } = useChat();
  const chatInputRef = useRef<ChatInputHandle>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["messages", threadId],
    queryFn: () => getMessages(threadId!),
    enabled: threadId !== null && threadId !== 0,
  });

  const handleSubmit = async (content: string) => {
    if (threadId === 0 || threadId === null) {
      const result = await createThread(content);
      onThreadCreated(result.thread.id);
    } else {
      await sendMessage({ threadId, message: content });
    }
  };

  useEffect(() => {
    const scrollArea = document.querySelector("[data-radix-scroll-area-viewport]");
    if (scrollArea) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Focus the input when the component mounts
    chatInputRef.current?.focus();
  }, []);

  if (threadId === null) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a chat or start a new one
      </div>
    );
  }

  if (isLoading && threadId !== 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <ReactMarkdown 
                    className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline ? (
                          <pre className="bg-muted-foreground/10 rounded-md p-4 my-2 overflow-x-auto">
                            <code className={match ? `language-${match[1]}` : ''} {...props}>
                              {children}
                            </code>
                          </pre>
                        ) : (
                          <code className="bg-muted-foreground/10 rounded-sm px-1" {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="max-w-3xl mx-auto">
          <ChatInput ref={chatInputRef} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}