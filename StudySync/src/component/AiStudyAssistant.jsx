
import { useState } from "react";
import "./AiStudyAssistant.css";

const API_URL = "http://localhost:9000/api/ai-assistant/chat";

function AiStudyAssistant({ task = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hi! I'm your StudySync AI Study Assistant. Choose a task and I'll help you complete it step by step.",
    },
  ]);
  const [history, setHistory] = useState([]);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const taskContext = {
    title: task?.title || task?.taskName || "General study",
    description: task?.description || task?.notes || "",
  };

  const completedCount = steps.filter((step) => step.done).length;

  const sendRequest = async (content, action = "chat") => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in again to use the AI assistant.");
      return;
    }

    setLoading(true);
    setError("");

    const userMessage = { role: "user", text: content };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          task: taskContext,
          history: history.slice(-12),
          action,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to contact the AI.");
      }

      const answer = {
        role: "model",
        text: data.reply,
      };

      setMessages((previous) => [...previous, answer]);

      setHistory((previous) =>
        [
          ...previous,
          userMessage,
          answer,
        ].slice(-12)
      );

      if (action === "plan" && Array.isArray(data.steps)) {
        setSteps(
          data.steps.map((step) => ({
            title: step.title,
            done: false,
          }))
        );
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();

    const content = message.trim();

    if (!content || loading) return;

    setMessage("");
    await sendRequest(content);
  };

  const createPlan = async () => {
    if (loading) return;

    const prompt = `Create a step-by-step checklist to complete this task: ${taskContext.title}. ${taskContext.description}`;

    await sendRequest(prompt, "plan");
  };

  const toggleStep = (index) => {
    setSteps((previous) =>
      previous.map((step, stepIndex) =>
        stepIndex === index
          ? { ...step, done: !step.done }
          : step
      )
    );
  };

  const startNewChat = () => {
    setMessages([
      {
        role: "model",
        text: "Hi! What would you like to learn or complete today?",
      },
    ]);
    setHistory([]);
    setSteps([]);
    setError("");
  };

  return (
    <div className="study-ai-root">
      {isOpen && (
        <section className="study-ai-panel">
          <header className="study-ai-header">
            <div className="study-ai-brand">
              <div className="study-ai-avatar">AI</div>
              <div>
                <h5>StudySync AI</h5>
                <span>Your personal study guide</span>
              </div>
            </div>

            <div className="study-ai-header-actions">
              <button
                type="button"
                onClick={startNewChat}
                className="study-ai-icon-btn"
                title="New chat"
                aria-label="Start a new chat"
              >
                ↻
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="study-ai-icon-btn"
                aria-label="Close assistant"
              >
                ×
              </button>
            </div>
          </header>

          <div className="study-ai-task" >
            <span>YOUR CURRENT TASK</span>
            <strong >{taskContext.title}</strong>

            <button
              type="button"
              onClick={createPlan}
              disabled={loading}
              className="study-ai-plan-btn"
            >
              Break task into steps
            </button>
          </div>

          <div className="study-ai-messages">
            {messages.map((item, index) => (
              <div
                key={`${index}-${item.role}`}
                className={`study-ai-message ${
                  item.role === "user" ? "user-message" : "bot-message"
                }`}
              >
                {item.role === "model" && (
                  <div className="study-ai-small-avatar">AI</div>
                )}

                <div className="study-ai-bubble">
                  {item.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="study-ai-loading">
                AI is thinking...
              </div>
            )}

            {error && (
              <div className="study-ai-error" role="alert">
                {error}
              </div>
            )}
          </div>

          {steps.length > 0 && (
            <div className="study-ai-checklist">
              <div className="study-ai-checklist-heading">
                <strong>Task checklist</strong>
                <span>
                  {completedCount}/{steps.length} completed
                </span>
              </div>

              <div className="study-ai-progress">
                <div
                  style={{
                    width: `${
                      (completedCount / steps.length) * 100
                    }%`,
                  }}
                />
              </div>

              {steps.map((step, index) => (
                <label
                  key={`${index}-${step.title}`}
                  className={`study-ai-step ${
                    step.done ? "step-done" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={step.done}
                    onChange={() => toggleStep(index)}
                  />
                  <span>{step.title}</span>
                </label>
              ))}
            </div>
          )}

          <form className="study-ai-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Ask a question or request a hint..."
              maxLength={4000}
              disabled={loading}
              aria-label="Message the AI assistant"
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>

          <div className="study-ai-footer">
            AI can make mistakes. Review important information.
          </div>
        </section>
      )}

      <button
        type="button"
        className="study-ai-launcher"
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      >
        {isOpen ? "×" : "✦"}
      </button>
    </div>
  );
}

export default AiStudyAssistant;
