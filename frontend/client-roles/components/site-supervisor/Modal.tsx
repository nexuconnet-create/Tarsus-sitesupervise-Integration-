"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

export interface ModalProps {
    /** Whether the modal is visible */
    open: boolean;
    /** Called when the user closes the modal (overlay click, X button, Escape) */
    onClose: () => void;
    /** Modal heading text */
    title: string;
    /** Optional subtitle / description beneath the title */
    subtitle?: string;
    /** Max-width tailwind class. Defaults to "max-w-lg" */
    size?: "max-w-sm" | "max-w-md" | "max-w-lg" | "max-w-xl" | "max-w-2xl" | "max-w-3xl";
    /** Render anything inside the modal body */
    children: React.ReactNode;
    /** Optional footer — action buttons rendered below the body */
    footer?: React.ReactNode;
    /** Hides the default X close button when true */
    hideClose?: boolean;
    /** Prevents closing when clicking the overlay */
    persistent?: boolean;
}

export default function Modal({
    open,
    onClose,
    title,
    subtitle,
    size = "max-w-lg",
    children,
    footer,
    hideClose = false,
    persistent = false,
}: ModalProps) {
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !persistent) onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose, persistent]);

    // Lock body scroll while open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => !persistent && onClose()}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={`relative ${size} w-full mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200`}
            >
                {/* Header */}
                <div className="bg-[#021422] px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    {!hideClose && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Reusable sub-components for consistent form styling ─── */

/** Standard modal text input */
export function ModalInput({
    label,
    ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#021422] mb-1.5">
                {label}
            </label>
            <input
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#021422] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-shadow"
                {...props}
            />
        </div>
    );
}

/** Standard modal textarea */
export function ModalTextarea({
    label,
    ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#021422] mb-1.5">
                {label}
            </label>
            <textarea
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#021422] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-shadow resize-none"
                rows={3}
                {...props}
            />
        </div>
    );
}

/** Standard modal select */
export function ModalSelect({
    label,
    options,
    ...props
}: {
    label: string;
    options: { value: string; label: string }[];
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#021422] mb-1.5">
                {label}
            </label>
            <select
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-[#021422] bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-shadow"
                {...props}
            >
                <option value="">Select...</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

/** Primary (dark) button — consistent with the app's [#021422] buttons */
export function ModalPrimaryButton({
    children,
    loading,
    ...props
}: { loading?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className="px-6 py-2.5 bg-[#021422] text-white text-xs font-bold uppercase rounded shadow hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            disabled={loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}

/** Secondary (blue) button — consistent with the app's [#007AFF] buttons */
export function ModalSecondaryButton({
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className="px-6 py-2.5 bg-[#007AFF] text-white text-xs font-bold uppercase rounded shadow hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            {...props}
        >
            {children}
        </button>
    );
}

/** Cancel / ghost button */
export function ModalCancelButton({
    children = "Cancel",
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className="px-6 py-2.5 text-xs font-bold uppercase text-gray-500 hover:text-[#021422] transition-colors"
            {...props}
        >
            {children}
        </button>
    );
}
