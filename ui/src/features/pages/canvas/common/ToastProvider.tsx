import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export enum ToastTypes {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
}

export type ToastType = ToastTypes.INFO | ToastTypes.WARNING | ToastTypes.WARNING;

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
    removing?: boolean;
}

const TOAST_TYPE_COLOR_MAP = {
    "info": "#1976d2bf",
    "warning": "#fbc02dbf",
    "error": "#d32f2fbf",
};

interface ToastContextProps {
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = (): ToastContextProps => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

interface ToastProviderProps {
    children: ReactNode;
}

const FADE_DURATION = 1000; //FIXME seems doesn't work as expected

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((message: string, type: ToastType = ToastTypes.INFO, duration: number = 3000) => {
        // Create a unique id (using current time; consider a more robust solution for production)
        const id = new Date().getTime();
        setToasts((prev) => [...prev, { id, message, type, removing: false }]);
        // Schedule removal of the toast after the specified duration
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((toast) => (toast.id === id ? { ...toast, removing: true } : toast))
            );
            removeToast(id);
        }, duration);
    },
        [removeToast]
    );

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

interface ToastContainerProps {
    toasts: Toast[];
    removeToast: (id: number) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
    return (
        <>
            <style>
                {`
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
        `}
            </style>
            <div
                style={{
                    position: "fixed",
                    bottom: "20px",
                    left: "3rem",
                    width: "35rem",
                    zIndex: 10000,
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                }}
            >
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        style={{
                            backgroundColor: TOAST_TYPE_COLOR_MAP[toast.type],
                            color: "white",
                            padding: "10px 15px",
                            borderRadius: "4px",
                            minWidth: "200px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            animation: toast.removing ? `fadeOut ${FADE_DURATION}ms forwards` : undefined,
                        }}
                    >
                        <span>{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "white",
                                cursor: "pointer",
                                fontSize: "16px",
                                lineHeight: "1",
                                alignSelf: "flex-start",
                            }}
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
};
