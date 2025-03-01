type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
}

class Logger {
    private static instance: Logger;
    private readonly maxLogSize = 1000;
    private logs: LogEntry[] = [];

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            context
        };

        // Add to in-memory logs
        this.logs.push(entry);
        if (this.logs.length > this.maxLogSize) {
            this.logs.shift();
        }

        // Console output with styling
        const styles = {
            debug: 'color: gray',
            info: 'color: blue',
            warn: 'color: orange',
            error: 'color: red; font-weight: bold'
        };

        console.log(
            `%c[${entry.timestamp}] [${level.toUpperCase()}] ${message}`,
            styles[level]
        );

        if (context) {
            console.log('Context:', context);
        }

        // For errors, we might want to send them to an error tracking service
        if (level === 'error') {
            // TODO: Implement error tracking service integration
            // e.g., Sentry, LogRocket, etc.
        }
    }

    public debug(message: string, context?: Record<string, unknown>) {
        this.log('debug', message, context);
    }

    public info(message: string, context?: Record<string, unknown>) {
        this.log('info', message, context);
    }

    public warn(message: string, context?: Record<string, unknown>) {
        this.log('warn', message, context);
    }

    public error(message: string, context?: Record<string, unknown>) {
        this.log('error', message, context);
    }

    public getLogs(): LogEntry[] {
        return [...this.logs];
    }
}

export const logger = Logger.getInstance(); 