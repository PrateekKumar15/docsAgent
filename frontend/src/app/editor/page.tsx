"use client";
import React, { useEffect, useRef, useState } from "react";
import {
  SignInButton,
  useUser,
  UserButton,
  SignOutButton,
} from "@clerk/nextjs";
import gsap from "gsap";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "@/store";
import {
  setMessages,
  setChats,
  setSelectedChatId,
  setUrls,
  setInput,
  setLoading,
  addMessage,
  addChat,
  updateChatTitle,
  deleteChat as deleteChatAction,
  resetEditor,
} from "@/slices/editorSlice";
import {
  MenuIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Trash2Icon,
  LinkIcon,
  SendIcon,
  Loader2Icon,
  MessageSquareText,
} from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
}
interface Chat {
  id: string;
  title: string;
  urls?: string[];
  messages: Message[];
}

export default function EditorPage() {
  const { isSignedIn, user } = useUser();
  const dispatch = useDispatch<AppDispatch>();
  const messages = useSelector((state: RootState) => state.editor.messages);
  const chats = useSelector((state: RootState) => state.editor.chats);
  const selectedChatId = useSelector(
    (state: RootState) => state.editor.selectedChatId
  );
  const urls = useSelector((state: RootState) => state.editor.urls);
  const input = useSelector((state: RootState) => state.editor.input);
  const loading = useSelector((state: RootState) => state.editor.loading);
  const chatRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [renameInput, setRenameInput] = useState("");
  const [currentUrlInput, setCurrentUrlInput] = useState("");

  useEffect(() => {
    if (!isSignedIn || !user) return;
    fetch(`http://127.0.0.1:8000/api/users/${user.id}/chats`)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errorData) => {
            throw new Error(
              errorData.error ||
                `Failed to fetch chats with status: ${res.status}`
            );
          });
        }
        return res.json();
      })
      .then((chatsArray: Chat[]) => {
        if (chatsArray && chatsArray.length > 0) {
          dispatch(setChats(chatsArray));
          const lastChat = chatsArray[0];
          dispatch(setSelectedChatId(lastChat.id));
          const chatUrls = lastChat.urls || [];
          dispatch(setUrls(chatUrls));
          dispatch(
            setMessages(
              lastChat.messages.map((m: Message) => ({
                role: m.role,
                content: m.content,
              }))
            )
          );
        } else {
          dispatch(resetEditor());
        }
      })
      .catch((error) => {
        console.error("Failed to fetch chats:", error.message);
        dispatch(resetEditor());
      });
  }, [isSignedIn, user, dispatch]);

  useEffect(() => {
    if (chatRef.current) {
      gsap.to(chatRef.current, {
        scrollTop: chatRef.current.scrollHeight,
        duration: 0.5,
      });
    }
  }, [messages]);

  const handleSelectChat = (chat: Chat) => {
    dispatch(setSelectedChatId(chat.id));
    const chatUrls = chat.urls || [];
    dispatch(setUrls(chatUrls));
    dispatch(
      setMessages(
        chat.messages.map((m: Message) => ({
          role: m.role,
          content: m.content,
        }))
      )
    );
    dispatch(setInput(""));
  };

  const handleNewChat = () => {
    dispatch(resetEditor());
    setCurrentUrlInput("");
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    if (!user || !newTitle.trim()) {
      console.error("User not available or title is empty for renaming chat.");
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}/rename`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newTitle,
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to rename chat:", errorData.error);
        return;
      }

      const updatedChat = await response.json();
      dispatch(
        updateChatTitle({ chatId: updatedChat.id, title: updatedChat.title })
      );
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!user) {
      console.error("User not available for deleting chat.");
      return;
    }
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/chats/${chatId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to delete chat:", errorData.error);
        return;
      }

      const result = await response.json();
      console.log(result.message);
      dispatch(deleteChatAction(chatId));
      if (selectedChatId === chatId) {
        const remainingChats = chats.filter((c) => c.id !== chatId);
        if (remainingChats.length > 0) {
          handleSelectChat(remainingChats[0]);
        } else {
          handleNewChat();
        }
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleAddUrl = () => {
    const trimmedUrl = currentUrlInput.trim();
    if (trimmedUrl && !urls.includes(trimmedUrl)) {
      if (selectedChatId && messages.length > 0) {
        console.warn(
          "Cannot add URLs to an active chat session with messages."
        );
        return;
      }
      dispatch(setUrls([...urls, trimmedUrl]));
      setCurrentUrlInput("");
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    if (selectedChatId && messages.length > 0) {
      console.warn(
        "Cannot remove URLs from an active chat session with messages."
      );
      return;
    }
    dispatch(setUrls(urls.filter((url) => url !== urlToRemove)));
  };

  const handleSend = async () => {
    if (!input.trim() || urls.length === 0 || !user) return;
    dispatch(setLoading(true));
    dispatch(addMessage({ role: "user", content: input }));
    const currentInput = input;
    dispatch(setInput(""));

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: urls,
          question: currentInput,
          userId: user.id,
          chatId: selectedChatId,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(addMessage({ role: "ai", content: data.answer }));

        if (data.chat) {
          const serverChat = data.chat as Chat;
          if (!selectedChatId || selectedChatId !== serverChat.id) {
            dispatch(addChat(serverChat));
            dispatch(setSelectedChatId(serverChat.id));
          } else {
            const existingChatIndex = chats.findIndex(
              (c) => c.id === serverChat.id
            );
            if (existingChatIndex !== -1) {
              const updatedChats = [...chats];
              updatedChats[existingChatIndex] = serverChat;
              dispatch(setChats(updatedChats));
            } else {
              dispatch(addChat(serverChat));
            }
          }
        }
      } else {
        dispatch(
          addMessage({
            role: "ai",
            content: data.error || "Error: Could not get answer.",
          })
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      dispatch(
        addMessage({ role: "ai", content: "Error: Could not get answer." })
      );
    }
    dispatch(setLoading(false));
  };

  if (!isSignedIn) {
    return (
      <>
        <main className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-neutral-100">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center p-8 bg-neutral-900 rounded-xl shadow-2xl"
          >
            <h1 className="text-4xl font-bold mb-3 text-primary">Welcome!</h1>
            <p className="text-lg text-neutral-300 mb-6">
              Please sign in to access the AI Document Agent editor.
            </p>
            <SignInButton mode="modal">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-transform hover:scale-105 shadow-lg"
              >
                Sign In to Continue
              </Button>
            </SignInButton>
          </motion.div>
        </main>
      </>
    );
  }

  return (
    <>
      <div
        className={`flex h-screen overflow-hidden bg-neutral-950 text-neutral-100`}
      >
        <aside
          className={`bg-neutral-900 border-r border-neutral-700/60 flex flex-col gap-4 transition-all duration-300 ease-in-out relative ${
            isSidebarOpen ? "w-72 p-6" : "w-20 p-4 items-center"
          }`}
        >
          <div
            className={`flex items-center ${
              isSidebarOpen ? "justify-between" : "justify-center"
            } mb-4 w-full`}
          >
            <div className="flex items-center gap-3">
              {isSidebarOpen && (
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
                  AI Agent
                </h2>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-700/50"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              {isSidebarOpen ? (
                <ChevronLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleNewChat}
            className={`w-full text-neutral-300 border-purple-500/70 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-200 ease-in-out group ${
              !isSidebarOpen &&
              "aspect-square p-0 flex justify-center items-center"
            }`}
            title="New Chat"
          >
            {isSidebarOpen ? (
              <span className="flex items-center justify-center">
                <PlusIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" /> New Chat
              </span>
            ) : (
              <PlusIcon className="h-6 w-6 group-hover:animate-pulse" />
            )}
          </Button>

          {isSidebarOpen && (
            <p className="text-xs text-neutral-500 px-1 mt-1 mb-0">
              Your recent conversations.
            </p>
          )}

          <div
            className={`flex-grow overflow-y-auto space-y-2 pr-0.5 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50 ${
              !isSidebarOpen && "mt-2"
            }`}
          >
            {chats.map((chat) => (
              <Card
                key={chat.id}
                className={`p-2.5 cursor-pointer transition-all duration-200 ease-in-out rounded-lg shadow-sm hover:shadow-md ${
                  selectedChatId === chat.id
                    ? "bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-orange-600/30 border-purple-500/80 text-neutral-50 ring-2 ring-purple-500/70"
                    : "bg-neutral-800/80 border-neutral-700/70 hover:bg-neutral-700/90 text-neutral-300 hover:text-neutral-100 hover:border-neutral-600"
                } ${
                  !isSidebarOpen && "p-0 aspect-square flex items-center justify-center"
                }`}
                onClick={() => {
                  handleSelectChat(chat);
                  if (!isSidebarOpen) setIsSidebarOpen(true); // Open sidebar on chat select if closed
                }}
                title={chat.title || "Untitled Chat"}
              >
                {isSidebarOpen ? (
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-sm font-medium truncate ${
                        selectedChatId === chat.id
                          ? "text-neutral-50"
                          : "text-neutral-300"
                      }`}
                    >
                      {chat.title?.slice(0, 20) || "Untitled Chat"}
                      {chat.title && chat.title.length > 20 ? "..." : ""}
                    </span>
                    <div className="flex items-center space-x-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 rounded-md hover:bg-neutral-700/50 ${
                              selectedChatId === chat.id
                                ? "text-neutral-200 hover:text-neutral-50"
                                : "text-neutral-400 hover:text-neutral-100"
                            }`}
                            title="Rename chat"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameInput(chat.title || "");
                            }}
                          >
                            <MenuIcon className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side="bottom"
                          className="p-6 rounded-t-lg sm:max-w-lg mx-auto bg-neutral-900 border-neutral-700 text-neutral-100 shadow-2xl"
                        >
                          <SheetTitle className="text-neutral-50 text-lg font-semibold">
                            Rename Chat
                          </SheetTitle>
                          <SheetDescription className="mt-1 mb-4 text-sm text-neutral-400">
                            Enter a new title for this chat session.
                          </SheetDescription>
                          <Input
                            placeholder="Enter new chat title"
                            value={renameInput}
                            onChange={(e) => setRenameInput(e.target.value)}
                            className="mb-4 bg-neutral-800 border-neutral-600 text-neutral-100 placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500/50 rounded-md"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && renameInput.trim()) {
                                handleRenameChat(chat.id, renameInput);
                                // Consider closing sheet here if desired: document.querySelector('[data-radix-sheet-close]')?.click();
                              }
                            }}
                          />
                          <div className="flex justify-end gap-3">
                            <SheetClose asChild>
                              <Button
                                variant="outline"
                                className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 rounded-md"
                              >
                                Cancel
                              </Button>
                            </SheetClose>
                            <SheetClose asChild>
                              <Button
                                onClick={() =>
                                  handleRenameChat(chat.id, renameInput)
                                }
                                disabled={!renameInput.trim()}
                                className="bg-purple-600 hover:bg-purple-700 text-white rounded-md"
                              >
                                Save Changes
                              </Button>
                            </SheetClose>
                          </div>
                        </SheetContent>
                      </Sheet>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className={`h-7 w-7 rounded-md hover:bg-red-500/20 hover:text-red-400 ${
                              selectedChatId === chat.id
                                ? "text-neutral-200 hover:text-red-400"
                                : "text-neutral-400"
                            }`}
                            title="Delete chat"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-neutral-700 text-neutral-100 shadow-2xl rounded-lg">
                          <AlertDialogTitle className="text-neutral-50 text-lg font-semibold">
                            Confirm Deletion
                          </AlertDialogTitle>
                          <p className="text-sm text-neutral-400 mt-2">
                            Are you sure you want to delete the chat: &quot;
                            <span className="font-semibold text-neutral-300">{chat.title || "Untitled Chat"}</span>&quot;? This action
                            cannot be undone.
                          </p>
                          <div className="flex justify-end gap-3 mt-5">
                            <AlertDialogCancel className="border-neutral-600 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 rounded-md">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteChat(chat.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                              Delete Chat
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ) : (
                  // Collapsed sidebar: Show first letter of chat title or a generic icon
                  <span className="text-sm font-bold text-neutral-400 group-hover:text-neutral-100">
                    {chat.title?.charAt(0).toUpperCase() || "C"}
                  </span>
                )}
              </Card>
            ))}
          </div>

          <div className="mt-auto pt-4 border-t border-neutral-700/60 w-full">
            <div
              className={`flex items-center gap-3 ${
                isSidebarOpen ? "justify-start" : "justify-center flex-col"
              }`}
            >
              <UserButton afterSignOutUrl="/" />
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-neutral-200 truncate max-w-[120px]">
                    {user?.firstName || user?.username}
                  </span>
                  <SignOutButton>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-neutral-400 hover:text-red-400 p-0 h-auto text-xs justify-start"
                    >
                      <LogOutIcon className="h-3 w-3 mr-1.5" /> Sign Out
                    </Button>
                  </SignOutButton>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col h-screen bg-neutral-950 overflow-hidden">
          {/* Header for URL inputs */}
          <header className="p-4 border-b border-neutral-800/80 bg-neutral-900 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <LinkIcon className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-neutral-200">
                Manage Document URLs
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="url"
                placeholder="Enter document URL (e.g., https://example.com/doc.pdf)"
                value={currentUrlInput}
                onChange={(e) => setCurrentUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                className="flex-grow bg-neutral-800 border-neutral-700 text-neutral-200 placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500/50 rounded-md shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading || (!!selectedChatId && messages.length > 0)}
              />
              <Button
                onClick={handleAddUrl}
                disabled={!currentUrlInput.trim() || loading || (!!selectedChatId && messages.length > 0)}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm disabled:opacity-60"
              >
                <PlusIcon className="h-5 w-5 mr-1.5" /> Add URL
              </Button>
            </div>
            {urls.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {urls.map((url, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between p-2 bg-neutral-800/70 rounded-md border border-neutral-700/60 text-sm"
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 hover:underline truncate flex-1 mr-2"
                      title={url}
                    >
                      {url}
                    </a>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemoveUrl(url)}
                      disabled={loading || (!!selectedChatId && messages.length > 0)}
                      className="text-neutral-400 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 disabled:opacity-50"
                      title="Remove URL"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
            {urls.length === 0 && !loading && (
              <p className="text-xs text-neutral-500 mt-2.5">
                Add at least one URL to start chatting.
              </p>
            )}
          </header>

          {/* Chat messages area */}
          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50"
          >
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-xl lg:max-w-2xl p-3.5 rounded-xl shadow-md ${
                    msg.role === "user"
                      ? "bg-purple-600/90 text-neutral-50 rounded-br-none"
                      : "bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700/80"
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </Card>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-start"
              >
                <Card className="max-w-xl lg:max-w-2xl p-3.5 rounded-xl shadow-md bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700/80">
                  <div className="flex items-center">
                    <Loader2Icon className="h-5 w-5 text-purple-400 animate-spin mr-2.5" />
                    <p className="text-sm text-neutral-400">
                      AI is thinking...
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}
            {messages.length === 0 && !loading && urls.length > 0 && (
              <div className="text-center text-neutral-500 pt-10">
                <MessageSquareText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg">
                  Ready to answer your questions about the provided documents.
                </p>
                <p className="text-sm">
                  Type your query below to get started.
                </p>
              </div>
            )}
            {messages.length === 0 && !loading && urls.length === 0 && (
              <div className="text-center text-neutral-500 pt-10">
                <LinkIcon size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg">
                  Please add at least one document URL above.
                </p>
                <p className="text-sm">
                  Once URLs are added, you can ask questions about their content.
                </p>
              </div>
            )}
          </div>

          {/* Input area */}
          <footer className="p-4 border-t border-neutral-800/80 bg-neutral-900">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              <Input
                placeholder={
                  urls.length === 0
                    ? "Add URLs above to enable chat"
                    : "Ask a question about the document(s)..."
                }
                value={input}
                onChange={(e) => dispatch(setInput(e.target.value))}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-grow bg-neutral-800 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-purple-500 focus:ring-purple-500/50 rounded-lg shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={urls.length === 0 || loading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || urls.length === 0 || loading}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm px-5 py-2.5 disabled:opacity-60"
                title="Send Message"
              >
                {loading ? (
                  <Loader2Icon className="h-5 w-5 animate-spin" />
                ) : (
                  <SendIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
