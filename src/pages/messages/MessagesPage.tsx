import React, { useState, useCallback } from 'react';
import {
  Layout,
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Tag,
  Space,
  Typography,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Alert,
  Switch,
} from 'antd';
import {
  SearchOutlined,
  DeleteOutlined,
  UserOutlined,
  ReloadOutlined,
  WifiOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import type { RangePickerProps } from 'antd/es/date-picker';
import { getMessages, getChatRooms, deleteMessage } from '../../services/api';
import { useRealtimeStore } from '../../store/realtimeStore';
import webSocketService from '../../services/websocket/websocketService';
import UserDetailModal from '../../components/modals/UserDetailModal';
import type { Message, User, MessageFilter } from '../../shared/types';

dayjs.locale('tr');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MessagesPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const { isConnected, realtimeMessages, removeRealtimeMessage } = useRealtimeStore();

  const [filter, setFilter] = useState<MessageFilter>({ page: 0, size: 20 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [showRealtime, setShowRealtime] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<number | undefined>();

  // Fetch chat rooms for filter
  const { data: rooms = [] } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: getChatRooms,
    staleTime: 30000,
  });

  // Fetch messages
  const { data: messagesData, isLoading, refetch } = useQuery({
    queryKey: ['messages', filter],
    queryFn: () => getMessages(filter),
    staleTime: 10000,
    placeholderData: (prev) => prev,
  });

  // Subscribe to specific room
  const subscribeToRoom = useCallback(
    (roomId: number) => {
      return webSocketService.subscribeToRoom(roomId, (wsMsg) => {
        if (wsMsg.type === 'NEW_MESSAGE') {
          queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
      });
    },
    [queryClient]
  );

  // Select room
  const handleRoomSelect = (roomId: number | undefined) => {
    setSelectedRoom(roomId);
    setFilter((prev) => ({ ...prev, chatRoomId: roomId, page: 0 }));
    if (roomId) subscribeToRoom(roomId);
  };

  // Delete message mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMessage(id),
    onSuccess: (_, id) => {
      messageApi.success('Mesaj silindi');
      removeRealtimeMessage(id);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: () => messageApi.error('Silme işlemi başarısız'),
  });

  const handleViewUser = (user: Partial<User> & { id: number; username: string }) => {
    setSelectedUser(user as User);
    setUserModalOpen(true);
  };

  const handleDateRange = (_: unknown, dates: [string, string]) => {
    setFilter((prev) => ({
      ...prev,
      startDate: dates[0] || undefined,
      endDate: dates[1] || undefined,
      page: 0,
    }));
  };

  // Realtime + fetched messages combined
  const displayedMessages = showRealtime
    ? [...realtimeMessages, ...(messagesData?.content || [])]
    : messagesData?.content || [];

  const columns: ColumnsType<Message> = [
    {
      title: 'Gönderen',
      dataIndex: 'senderUsername',
      key: 'senderUsername',
      width: 140,
      render: (username: string, record: Message) => (
        <Button
          type="link"
          icon={<UserOutlined />}
          onClick={() =>
            handleViewUser({
              id: record.senderId,
              username,
              email: '',
              role: 'USER',
              status: 'ACTIVE',
              createdAt: '',
              totalMessages: 0,
            })
          }
          style={{ padding: 0 }}
        >
          {username}
        </Button>
      ),
    },
    {
      title: 'İçerik',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string, record: Message) => (
        <Space>
          {record.isDeleted && <Tag color="red">Silindi</Tag>}
          {record.isReported && (
            <Badge count={record.reportCount} size="small">
              <Tag color="orange">Raporlandı</Tag>
            </Badge>
          )}
          <Text style={{ opacity: record.isDeleted ? 0.5 : 1 }}>{content}</Text>
        </Space>
      ),
    },
    {
      title: 'Oda',
      dataIndex: 'chatRoomName',
      key: 'chatRoomName',
      width: 140,
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Zaman',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
          <Text type="secondary">{dayjs(date).fromNow()}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      width: 120,
      render: (_: unknown, record: Message) => (
        <Space>
          <Tooltip title="Kullanıcı Detayı">
            <Button
              size="small"
              icon={<UserOutlined />}
              onClick={() =>
                handleViewUser({
                  id: record.senderId,
                  username: record.senderUsername,
                  email: '',
                  role: 'USER',
                  status: 'ACTIVE',
                  createdAt: '',
                  totalMessages: 0,
                })
              }
            />
          </Tooltip>
          {!record.isDeleted && (
            <Popconfirm
              title="Mesajı sil?"
              description="Bu işlem geri alınamaz."
              onConfirm={() => deleteMutation.mutate(record.id)}
              okText="Sil"
              cancelText="İptal"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Sil">
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout.Content style={{ padding: 24 }}>
      {contextHolder}
      <Title level={4}>💬 Mesaj Takibi</Title>

      {/* WebSocket Status */}
      <Alert
        type={isConnected ? 'success' : 'warning'}
        icon={<WifiOutlined />}
        message={
          isConnected
            ? 'Gerçek zamanlı bağlantı aktif — yeni mesajlar otomatik güncelleniyor'
            : 'WebSocket bağlantısı kurulamadı — manuel yenileme gerekli'
        }
        style={{ marginBottom: 16 }}
        showIcon
      />

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Mesaj ara..."
              allowClear
              onChange={(e) =>
                setFilter((prev) => ({ ...prev, search: e.target.value || undefined, page: 0 }))
              }
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Chat odası seç"
              allowClear
              style={{ width: '100%' }}
              value={selectedRoom}
              onChange={handleRoomSelect}
              options={rooms.map((r) => ({ label: r.name, value: r.id }))}
              suffixIcon={<FilterOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRange as RangePickerProps['onChange']}
              format="DD/MM/YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
          <Col xs={24} sm={12} md={4}>
            <Space>
              <Switch
                checked={showRealtime}
                onChange={setShowRealtime}
                checkedChildren="Canlı"
                unCheckedChildren="Canlı"
              />
              <Tooltip title="Yenile">
                <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
              </Tooltip>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Active Rooms Summary */}
      {rooms.length > 0 && (
        <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
          {rooms.slice(0, 4).map((room) => (
            <Col xs={12} sm={6} key={room.id}>
              <Card
                size="small"
                hoverable
                style={{
                  cursor: 'pointer',
                  borderColor: selectedRoom === room.id ? '#1677ff' : undefined,
                }}
                onClick={() => handleRoomSelect(selectedRoom === room.id ? undefined : room.id)}
              >
                <Space direction="vertical" size={0}>
                  <Text strong>{room.name}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {room.memberCount} üye · {room.messageCount.toLocaleString('tr-TR')} mesaj
                  </Text>
                  <Badge
                    status={room.isActive ? 'processing' : 'default'}
                    text={room.isActive ? 'Aktif' : 'Pasif'}
                  />
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Messages Table */}
      <Card>
        <Table<Message>
          columns={columns}
          dataSource={displayedMessages}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: (filter.page || 0) + 1,
            pageSize: filter.size || 20,
            total: messagesData?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} mesaj`,
            onChange: (page, pageSize) =>
              setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize })),
          }}
          rowClassName={(record) => (record.isDeleted ? 'deleted-row' : '')}
          scroll={{ x: 800 }}
        />
      </Card>

      <UserDetailModal
        user={selectedUser}
        open={userModalOpen}
        onClose={() => {
          setUserModalOpen(false);
          setSelectedUser(null);
        }}
      />

      <style>{`
        .deleted-row td {
          opacity: 0.5;
          text-decoration: line-through;
        }
      `}</style>
    </Layout.Content>
  );
};

export default MessagesPage;
