"use client"
import Image from "next/image"
import assistGPTLogo from "./assets/assistGPTLogo.png"
import { useChat } from "ai/react"
import Bubble from "./assets/components/Bubble";
import LoadingBubble from "./assets/components/LoadingBubble";
import PromptSuggestionRow from "./assets/components/PromptSuggestionsRow";


const Home = () => {

    const {append, isLoading, messages, input, handleInputChange, handleSubmit, error} = useChat()

    const noMessage = !messages || messages.length === 0

    const handlePrompt = (promptText: string) => {
        const msg = {
            id: crypto.randomUUID(),
            content: promptText,
            role: "user" as const
        }
        append(msg)
    }

    return (
        <main>
            <div className="logo-container">
                <Image src = {assistGPTLogo} width="250" alt = "AssistGPT Logo"/>
            </div>
            <section className={noMessage ? "" : "populated"}>
                {noMessage ? (
                    <>
                        <p className="starter-text">
                            Your personal AI transfer counselor is here to help!
                            Get guidance on course requirements, transfer pathways, and 
                            academic planning for California community colleges and universities.
                            Ready to plan your educational journey?
                        </p>
                        <br/>
                        <PromptSuggestionRow onPromptClick = {handlePrompt}/>
                    </>
                ) : (
                    <div className="chat-container">
                        {messages.map((message, index) => <Bubble key={`message-${index}`} message={message}/>)}
                        {isLoading && <LoadingBubble/>}
                        {error && (
                            <div className="error-message">
                                Sorry, there was an error processing your request. Please try again.
                            </div>
                        )}
                    </div>
                )}
            </section>
            <form onSubmit={handleSubmit}>
                <input 
                    className="question-box" 
                    onChange={handleInputChange} 
                    value={input} 
                    placeholder="Ask me something ..."
                    aria-label="Ask a question about Formula 1"
                    disabled={isLoading}
                />
                <input 
                    type="submit" 
                    value="Send"
                    aria-label="Send message"
                    disabled={isLoading || input.trim().length === 0}
                />
            </form>
        </main>
    )
}

export default Home