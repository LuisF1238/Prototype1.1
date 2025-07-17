import  "./global.css"

export const metadata = {
    title: "F1GPT",
    description: "The place you go to foe your Formula One questions!",
}

const RootLayout = ({children}) => {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}

export default RootLayout