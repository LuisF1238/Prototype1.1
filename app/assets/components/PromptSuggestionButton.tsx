interface PromptSuggestionButtonProps {
    text: string
    onClick: () => void
}

const PromptSuggestionButton = ({ text, onClick }: PromptSuggestionButtonProps) => {
    const getIcon = (text: string) => {
        if (text.toLowerCase().includes('driver') || text.toLowerCase().includes('champion')) {
            return '🏆'
        }
        if (text.toLowerCase().includes('team') || text.toLowerCase().includes('aston martin')) {
            return '🏎️'
        }
        if (text.toLowerCase().includes('paid') || text.toLowerCase().includes('salary')) {
            return '💰'
        }
        if (text.toLowerCase().includes('ferrari') || text.toLowerCase().includes('newest')) {
            return '🔥'
        }
        return '❓'
    }

    return (
        <button
            className="prompt-suggestion-button"
            onClick={onClick}
        >
            <div className="button-content">
                <span className="button-icon">{getIcon(text)}</span>
                <span className="button-text">{text}</span>
                <span className="button-arrow">→</span>
            </div>
        </button>
    )
}
export default PromptSuggestionButton