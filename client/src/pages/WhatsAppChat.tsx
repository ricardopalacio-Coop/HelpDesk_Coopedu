import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, MessageSquare, Zap, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data para conversas
const mockConversations = [
  {
    id: 1,
    name: "João Silva",
    lastMessage: "Obrigado pelo atendimento!",
    time: "10:30",
    unread: 0,
    phone: "+55 11 98765-4321",
    type: "cooperado",
  },
  {
    id: 2,
    name: "Maria Santos",
    lastMessage: "Preciso de ajuda com meu contrato",
    time: "09:15",
    unread: 2,
    phone: "+55 11 98765-1234",
    type: "cooperado",
  },
  {
    id: 3,
    name: "+55 11 91234-5678",
    lastMessage: "Olá, gostaria de informações",
    time: "Ontem",
    unread: 1,
    phone: "+55 11 91234-5678",
    type: "nao_cooperado",
  },
];

const mockMessages = [
  {
    id: 1,
    content: "Olá! Preciso de ajuda com meu contrato",
    sender: "cooperado",
    time: "09:10",
  },
  {
    id: 2,
    content: "Olá Maria! Claro, como posso ajudar?",
    sender: "atendente",
    time: "09:12",
  },
  {
    id: 3,
    content: "Gostaria de saber sobre a renovação",
    sender: "cooperado",
    time: "09:13",
  },
  {
    id: 4,
    content: "Vou verificar as informações do seu contrato. Um momento por favor.",
    sender: "atendente",
    time: "09:14",
  },
  {
    id: 5,
    content: "Preciso de ajuda com meu contrato",
    sender: "cooperado",
    time: "09:15",
  },
];

export default function WhatsAppChat() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[1]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const { data: quickMessages } = trpc.quickMessages.list.useQuery();

  const filteredConversations = mockConversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phone.includes(searchQuery)
  );

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implementar envio de mensagem via tRPC
      console.log("Enviando mensagem:", message);
      setMessage("");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row h-[calc(100vh-2rem)] bg-background">
        {/* Lista de Conversas */}
        <div className="w-full md:w-[400px] border-r md:border-b-0 border-b flex flex-col bg-card max-h-[40vh] md:max-h-none">
          {/* Header da Lista */}
          <div className="p-4 border-b bg-[#005487]">
            <h2 className="text-lg font-semibold text-white mb-3">Conversas</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90"
              />
            </div>
          </div>

          {/* Lista de Conversas */}
          <ScrollArea className="flex-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-accent transition-colors border-b",
                  selectedConversation?.id === conversation.id && "bg-accent"
                )}
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback className="bg-[#00b7ff] text-white font-semibold">
                    {conversation.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {conversation.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="flex-shrink-0 ml-2 bg-[#3ab54a] text-white text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {conversation.type === "cooperado" ? "Cooperado" : "Não Cooperado"}
                  </span>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Área de Chat */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col">
            {/* Header do Chat */}
            <div className="p-4 border-b bg-[#005487] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#00b7ff] text-white font-semibold">
                    {selectedConversation.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-white">{selectedConversation.name}</h3>
                  <p className="text-xs text-white/70">{selectedConversation.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mensagens */}
            <ScrollArea className="flex-1 p-4 bg-[#e5ddd5]">
              <div className="space-y-3">
                {mockMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.sender === "atendente" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg p-3 shadow-sm",
                        msg.sender === "atendente"
                          ? "bg-[#d9fdd3] text-gray-900"
                          : "bg-white text-gray-900"
                      )}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-xs text-gray-500 mt-1 block text-right">
                        {msg.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input de Mensagem */}
            <div className="border-t bg-card">
              {/* Mensagens Rápidas */}
              {showQuickMessages && quickMessages && quickMessages.length > 0 && (
                <div className="p-4 border-b max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {quickMessages.map((qm: any) => (
                      <button
                        key={qm.id}
                        onClick={() => {
                          setMessage(qm.content);
                          setShowQuickMessages(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                      >
                        <p className="font-medium text-sm">{qm.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{qm.content}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Área de Input */}
              <div className="p-4 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setShowQuickMessages(!showQuickMessages)}
                >
                  <Zap className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Digite uma mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                {message.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#00b7ff] hover:bg-[#0095d9] text-white"
                    size="icon"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "text-muted-foreground hover:text-foreground",
                      isRecording && "text-red-500 animate-pulse"
                    )}
                    onMouseDown={() => setIsRecording(true)}
                    onMouseUp={() => setIsRecording(false)}
                    onMouseLeave={() => setIsRecording(false)}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#e5ddd5]">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
