import { useCallback, useEffect, useMemo, useState } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent, type RemoteParticipant } from "livekit-client";

// Ephemeral emoji reactions travel as LiveKit data messages (fire-and-forget,
// no persistence). Raise-hand is stateful, so it lives on a participant
// attribute — that way it survives for late joiners and clears explicitly.
const REACTION_TOPIC = "reaction";
const HAND_ATTR = "hand_raised";
const REACTION_TTL_MS = 4000;

export interface FloatingReaction {
  id: string;
  emoji: string;
  /** Identity (user UUID) of whoever sent it. */
  identity: string;
}

/**
 * Reactions + raise-hand for the current LiveKit room.
 *
 * Requires the join token to grant canUpdateOwnMetadata (set in the backend's
 * livekit_utils) so setAttributes() is allowed.
 */
export function useRoomReactions() {
  const room = useRoomContext();
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [remoteHands, setRemoteHands] = useState<Set<string>>(new Set());
  const [myHandRaised, setMyHandRaised] = useState<boolean>(
    () => Boolean(room.localParticipant.attributes?.[HAND_ATTR]),
  );

  const pushReaction = useCallback((emoji: string, identity: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setReactions((prev) => [...prev, { id, emoji, identity }]);
    setTimeout(
      () => setReactions((prev) => prev.filter((r) => r.id !== id)),
      REACTION_TTL_MS,
    );
  }, []);

  // Incoming reaction data messages → floating emoji.
  useEffect(() => {
    const decoder = new TextDecoder();
    const onData = (
      payload: Uint8Array,
      participant?: RemoteParticipant,
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== REACTION_TOPIC) return;
      try {
        const { emoji } = JSON.parse(decoder.decode(payload));
        if (emoji) pushReaction(emoji, participant?.identity ?? "remote");
      } catch {
        /* ignore malformed payloads */
      }
    };
    room.on(RoomEvent.DataReceived, onData);
    return () => {
      room.off(RoomEvent.DataReceived, onData);
    };
  }, [room, pushReaction]);

  // Track raised hands of *remote* participants from their attributes.
  useEffect(() => {
    const recompute = () => {
      const raised = new Set<string>();
      room.remoteParticipants.forEach((p) => {
        if (p.attributes?.[HAND_ATTR]) raised.add(p.identity);
      });
      setRemoteHands(raised);
    };
    recompute();
    room.on(RoomEvent.ParticipantAttributesChanged, recompute);
    room.on(RoomEvent.ParticipantConnected, recompute);
    room.on(RoomEvent.ParticipantDisconnected, recompute);
    return () => {
      room.off(RoomEvent.ParticipantAttributesChanged, recompute);
      room.off(RoomEvent.ParticipantConnected, recompute);
      room.off(RoomEvent.ParticipantDisconnected, recompute);
    };
  }, [room]);

  const sendReaction = useCallback(
    (emoji: string) => {
      const data = new TextEncoder().encode(JSON.stringify({ emoji }));
      room.localParticipant.publishData(data, {
        reliable: true,
        topic: REACTION_TOPIC,
      });
      pushReaction(emoji, room.localParticipant.identity);
    },
    [room, pushReaction],
  );

  const toggleHand = useCallback(() => {
    const next = !myHandRaised;
    setMyHandRaised(next); // optimistic — feels instant
    room.localParticipant.setAttributes({
      [HAND_ATTR]: next ? String(Date.now()) : "",
    });
  }, [room, myHandRaised]);

  // Union of remote raised hands + our own (tracked locally for responsiveness).
  const hands = useMemo(() => {
    const all = new Set(remoteHands);
    if (myHandRaised) all.add(room.localParticipant.identity);
    return all;
  }, [remoteHands, myHandRaised, room]);

  return { reactions, hands, myHandRaised, sendReaction, toggleHand };
}
