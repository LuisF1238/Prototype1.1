export class Logger {
    private static instance: Logger
    private logLevel: 'debug' | 'info' | 'warn' | 'error'

    private constructor(logLevel: 'debug' | 'info' | 'warn' | 'error' = 'info') {
        this.logLevel = logLevel
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    private shouldLog(level: string): boolean {
        const levels = ['debug', 'info', 'warn', 'error']
        return levels.indexOf(level) >= levels.indexOf(this.logLevel)
    }

    private formatMessage(level: string, message: string, data?: unknown): string {
        const timestamp = new Date().toISOString()
        const baseMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`
        
        if (data !== undefined) {
            return `${baseMessage} ${JSON.stringify(data, null, 2)}`
        }
        
        return baseMessage
    }

    debug(message: string, data?: unknown): void {
        if (this.shouldLog('debug')) {
            console.debug(this.formatMessage('debug', message, data))
        }
    }

    info(message: string, data?: unknown): void {
        if (this.shouldLog('info')) {
            console.info(this.formatMessage('info', message, data))
        }
    }

    warn(message: string, data?: unknown): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage('warn', message, data))
        }
    }

    error(message: string, error?: Error | unknown): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage('error', message, error))
        }
    }

    setLogLevel(level: 'debug' | 'info' | 'warn' | 'error'): void {
        this.logLevel = level
    }
}

export const logger = Logger.getInstance()