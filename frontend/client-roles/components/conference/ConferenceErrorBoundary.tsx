"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  /** Called when the user chooses to exit the broken conference UI. */
  onExit: () => void;
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time crashes inside the live conference (e.g. a LiveKit
 * component throwing after an abrupt network drop) so the user sees a friendly
 * "connection lost" screen with a way out, instead of Next.js's error overlay
 * or a frozen black room.
 *
 * Note: error boundaries only catch errors thrown during render/lifecycle —
 * async failures (fetch/WebSocket) are handled separately in ConferenceRoom.
 */
export default class ConferenceErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("[Conference] render crashed", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-[#021422] flex flex-col items-center justify-center gap-6 p-8 text-center">
          <AlertTriangle size={40} className="text-amber-400" />
          <div className="space-y-2">
            <p className="text-white font-bold text-lg">
              The meeting ran into a problem
            </p>
            <p className="text-white/70 max-w-md text-sm">
              This usually happens after a network drop. Your connection may have
              been lost — head back and rejoin the room.
            </p>
          </div>
          <button
            onClick={this.props.onExit}
            className="bg-[#0070D4] hover:bg-[#005bb5] text-white px-6 py-3 rounded-full font-bold transition-colors"
          >
            Back to Lobby
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
