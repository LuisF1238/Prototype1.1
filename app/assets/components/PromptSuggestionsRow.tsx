import PromptSuggestionButton from "@/app/assets/components/PromptSuggestionButton";

interface PromptSuggestionRowProps {
    onPromptClick: (prompt: string) => void
}

const PromptSuggestionRow = ({ onPromptClick }: PromptSuggestionRowProps) => {
    const prompts = [
        "What classes do I need to transfer to UC Berkeley for Computer Science?",
        "Which CSU schools have the best programs for Engineering?",
        "What are the general education requirements for transferring to UCLA?",
        "How do I calculate my transfer GPA for UC applications?"
    ]

    return (
        <div className="prompt-suggestions-row">
            {prompts.map((prompt, index) =>
                <PromptSuggestionButton
                    key={`Suggestion-${index}`}
                    text={prompt}
                    onClick={() => onPromptClick(prompt)}
            />)}
        </div>
    )
}
export default PromptSuggestionRow