import { useEffect, useRef } from "react";
import { getAccessToken } from "../api/auth";

export function useSupportWebSocket(sessionId, onNewMessage, onFallback) {
  const onNewMessageRef = useRef(onNewMessage);
  const onFallbackRef = useRef(onFallback);
  onNewMessageRef.current = onNewMessage;
  onFallbackRef.current = onFallback;

  useEffect(() => {
    if (!sessionId) return;

    const token = getAccessToken();
    if (!token) {
      onFallbackRef.current?.();
      return;
    }

    const proto = location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${location.host}/api/ws/support-sessions/${sessionId}?token=${encodeURIComponent(token)}`;

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      onFallbackRef.current?.();
      return;
    }

    let opened = false;

    ws.onopen = () => { opened = true; };

    ws.onmessage = (e) => {
      try {
        onNewMessageRef.current?.(JSON.parse(e.data));
      } catch {}
    };

    ws.onerror = () => {
      if (!opened) onFallbackRef.current?.();
    };

    ws.onclose = (e) => {
      if (!opened && e.code !== 1000) onFallbackRef.current?.();
    };

    return () => {
      ws.close(1000);
    };
  }, [sessionId]);
}
