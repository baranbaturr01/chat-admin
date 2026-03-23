import { useEffect, useRef, useCallback } from 'react';
import { notification } from 'antd';
import webSocketService from '../../services/websocket/websocketService';
import { useAuthStore } from '../../store/authStore';
import { useRealtimeStore } from '../../store/realtimeStore';
import type { WebSocketMessage, Message, Report } from '../types';

export const useWebSocket = () => {
  const { token } = useAuthStore();
  const { setConnected, addRealtimeMessage, addRealtimeReport, removeRealtimeMessage } =
    useRealtimeStore();
  const connectedRef = useRef(false);

  const handleMessage = useCallback(
    (wsMsg: WebSocketMessage) => {
      switch (wsMsg.type) {
        case 'NEW_MESSAGE':
          addRealtimeMessage(wsMsg.payload as Message);
          break;
        case 'MESSAGE_DELETED':
          removeRealtimeMessage((wsMsg.payload as Message).id);
          break;
        case 'NEW_REPORT':
          addRealtimeReport(wsMsg.payload as Report);
          notification.warning({
            message: 'Yeni Rapor',
            description: `Mesaj raporlandı: "${(wsMsg.payload as Report).messageContent?.slice(0, 50)}${((wsMsg.payload as Report).messageContent?.length ?? 0) > 50 ? '...' : ''}"`,
            duration: 5,
          });
          break;
        case 'USER_BANNED':
        case 'USER_MUTED':
          notification.info({
            message: wsMsg.type === 'USER_BANNED' ? 'Kullanıcı Banlandı' : 'Kullanıcı Susturuldu',
            duration: 3,
          });
          break;
        default:
          break;
      }
    },
    [addRealtimeMessage, addRealtimeReport, removeRealtimeMessage]
  );

  useEffect(() => {
    if (!token || connectedRef.current) return;

    const connect = async () => {
      try {
        await webSocketService.connect(token);
        setConnected(true);
        connectedRef.current = true;

        const unsubMessages = webSocketService.subscribeToMessages(handleMessage);
        const unsubReports = webSocketService.subscribeToReports(handleMessage);
        const unsubUsers = webSocketService.subscribeToUserEvents(handleMessage);

        return () => {
          unsubMessages();
          unsubReports();
          unsubUsers();
        };
      } catch (err) {
        console.error('[useWebSocket] Connection failed:', err);
        setConnected(false);
      }
    };

    let cleanup: (() => void) | undefined;
    connect().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
      if (connectedRef.current) {
        webSocketService.disconnect();
        setConnected(false);
        connectedRef.current = false;
      }
    };
  }, [token, handleMessage, setConnected]);

  return {
    isConnected: webSocketService.isConnected(),
  };
};
