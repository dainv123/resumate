"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { cvApi, QuickBuildCvData } from "@/lib/cv";
import {
  Send,
  Bot,
  User,
  Download,
  Sparkles,
  Edit,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

interface ConversationState {
  currentStep: number;
  collectedData: Partial<QuickBuildCvData>;
  isCompleted: boolean;
  generatedCv?: any;
}

const AiCvWizard: React.FC = () => {
  const { t, language } = useLanguage();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [conversationState, setConversationState] = useState<ConversationState>(
    {
      currentStep: 0,
      collectedData: {},
      isCompleted: false,
    }
  );

  const conversationSteps = [
    {
      key: "basicInfo",
      question: t("aiCvWizard.questions.name"),
      field: "name",
    },
    {
      key: "email",
      question: t("aiCvWizard.questions.email"),
      field: "email",
    },
    {
      key: "targetRole",
      question: t("aiCvWizard.questions.targetRole"),
      field: "targetRole",
    },
    {
      key: "experience",
      question: t("aiCvWizard.questions.experience"),
      field: "jobDescription",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input whenever messages change (after AI responds)
  useEffect(() => {
    if (inputRef.current && !isLoading && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isLoading]);

  // Focus input when conversation starts
  useEffect(() => {
    if (inputRef.current && messages.length === 1 && !isLoading) {
      // Focus after first AI message (welcome message)
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
    }
  }, [messages.length, isLoading]);

  // Focus input on component mount if input is available
  useEffect(() => {
    if (inputRef.current && messages.length === 0 && !conversationState.isCompleted) {
      inputRef.current.focus();
    }
  }, [messages.length, conversationState.isCompleted]); // Include dependencies

  const addMessage = (type: "user" | "ai", content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const startConversation = () => {
    setMessages([]);
    setConversationState({
      currentStep: 0,
      collectedData: {},
      isCompleted: false,
    });

    // Add welcome message first
    addMessage("ai", t("aiCvWizard.welcomeMessage"));

    // Add first question after a small delay to ensure unique keys
    setTimeout(() => {
      addMessage("ai", conversationSteps[0].question);
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userInput = inputValue.trim();
    setInputValue("");
    addMessage("user", userInput);

    setIsLoading(true);

    try {
      // Collect data based on current step
      const currentStepData = conversationSteps[conversationState.currentStep];
      const updatedData = {
        ...conversationState.collectedData,
        [currentStepData.field]: userInput,
      };

      setConversationState((prev) => ({
        ...prev,
        collectedData: updatedData,
        currentStep: prev.currentStep + 1,
      }));

      // Simulate AI thinking
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const nextStep = conversationState.currentStep + 1;
      if (nextStep < conversationSteps.length) {
        // Ask next question
        setTimeout(() => {
          addMessage("ai", conversationSteps[nextStep].question);
        }, 500);
      } else {
        // Generate CV
        setTimeout(() => {
          addMessage("ai", t("aiCvWizard.generating"));
          setIsGenerating(true);
        }, 500);

        const cvData: QuickBuildCvData = {
          name: updatedData.name || "",
          email: updatedData.email || "",
          targetRole: updatedData.targetRole || "",
          jobDescription: updatedData.jobDescription || "",
          template: "professional",
          language: language,
        };

        // Add timeout protection
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("CV generation timeout")), 30000); // 30 seconds
        });

        // Check if we already have a CV from previous conversation
        let generatedCv;
        if (conversationState.generatedCv) {
          // Update existing CV instead of creating new one
          generatedCv = await Promise.race([
            cvApi.updateCvWithQuickBuild(
              conversationState.generatedCv.id,
              cvData
            ),
            timeoutPromise,
          ]);
        } else {
          // Create new CV
          generatedCv = await Promise.race([
            cvApi.quickBuildCv(cvData),
            timeoutPromise,
          ]);
        }

        setConversationState((prev) => ({
          ...prev,
          isCompleted: true,
          generatedCv,
        }));

        setTimeout(() => {
          addMessage("ai", t("aiCvWizard.completed"));
          showSuccess(t("aiCvWizard.success.cvCreated"));
        }, 1000);
      }
    } catch (error) {
      console.error("Error in conversation:", error);
      addMessage("ai", t("aiCvWizard.errors.tryAgain"));
      showError(t("aiCvWizard.errors.processFailed"));

      // Reset conversation state on error
      setConversationState((prev) => ({
        ...prev,
        currentStep: Math.max(0, prev.currentStep - 1),
      }));
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
    }
  };

  const handleDownloadCv = async () => {
    if (!conversationState.generatedCv) {
      showError(t("aiCvWizard.errors.cvNotCreated"));
      return;
    }

    setIsGenerating(true);
    try {
      // Download the CV PDF using the already created CV
      const blob = await cvApi.exportToPDF(
        conversationState.generatedCv.id,
        "professional"
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `CV_${conversationState.collectedData.name?.replace(
        /\s+/g,
        "_"
      )}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showSuccess(t("aiCvWizard.success.cvDownloaded"));
    } catch (error) {
      console.error("Download CV error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      showError(t("aiCvWizard.errors.downloadFailed", { error: errorMessage }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditCv = () => {
    if (!conversationState.generatedCv) {
      showError(t("aiCvWizard.errors.cvNotCreated"));
      return;
    }

    // Redirect to CV management page with the CV ID
    router.push(`/dashboard/cv/${conversationState.generatedCv.id}/edit`);
  };

  const handleRestart = () => {
    setMessages([]);
    setConversationState({
      currentStep: 0,
      collectedData: {},
      isCompleted: false,
      generatedCv: undefined, // Clear existing CV to create new one
    });
  };

  const handleCreateNewCv = () => {
    setMessages([]);
    setConversationState({
      currentStep: 0,
      collectedData: {},
      isCompleted: false,
      generatedCv: undefined, // Clear existing CV to create new one
    });
  };

  const getProgressPercentage = () => {
    if (conversationState.isCompleted) return 100;
    return (
      ((conversationState.currentStep + 1) / conversationSteps.length) * 100
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t("aiCvWizard.title")}
        </h1>
        <p className="text-gray-600 mb-6">{t("aiCvWizard.subtitle")}</p> */}

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center space-x-4 text-sm">
          {conversationSteps.map((step, index) => (
            <div
              key={step.key}
              className={`px-3 py-1 rounded-full ${
                index <= conversationState.currentStep
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-500"
              }`}>
              {t(`aiCvWizard.conversationSteps.${step.key}`)}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <Bot className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-4">{t("aiCvWizard.welcomeMessage")}</p>
              <Button
                onClick={startConversation}
                className="bg-blue-600 hover:bg-blue-700">
                <Sparkles className="h-4 w-4 mr-2" />
                {t("aiCvWizard.startConversation")}
              </Button>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.type === "user" ? "justify-end" : "justify-start"
                }`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.type === "user"
                        ? t("aiCvWizard.chat.you")
                        : t("aiCvWizard.chat.aiAssistant")}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs opacity-75">AI Assistant</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  <span className="text-xs ml-2">
                    {t("aiCvWizard.thinking")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Generating indicator */}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-xs opacity-75">AI Assistant</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
                  <span className="text-xs">{t("aiCvWizard.generating")}</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {messages.length > 0 && !conversationState.isCompleted && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={t("aiCvWizard.inputPlaceholder")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-blue-600 hover:bg-blue-700 px-6">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Completion Actions */}
        {conversationState.isCompleted && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={handleDownloadCv}
                disabled={isGenerating}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    {t("aiCvWizard.generating")}
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    {t("aiCvWizard.downloadCv")}
                  </>
                )}
              </Button>
              <Button
                onClick={handleEditCv}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {t("aiCvWizard.actions.editCv")}
              </Button>
              <Button
                onClick={handleCreateNewCv}
                className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t("aiCvWizard.actions.createNewCv")}
              </Button>
              {/* <Button
                onClick={handleRestart}
                variant="outline"
                className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                {t("aiCvWizard.restartWizard")}
              </Button> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiCvWizard;
