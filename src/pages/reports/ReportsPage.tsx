import React, { useState } from 'react';
import {
  Layout,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Badge,
  Tooltip,
  Popconfirm,
  message,
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Alert,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  WifiOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { getReports, resolveReport, dismissReport, getChatRooms } from '../../services/api';
import { useRealtimeStore } from '../../store/realtimeStore';
import UserDetailModal from '../../components/modals/UserDetailModal';
import type { Report, User, ReportFilter } from '../../shared/types';

dayjs.locale('tr');

const { Title, Text, Paragraph } = Typography;

const statusConfig: Record<Report['status'], { color: string; label: string }> = {
  PENDING: { color: 'orange', label: 'Bekliyor' },
  RESOLVED: { color: 'green', label: 'Çözüldü' },
  DISMISSED: { color: 'default', label: 'Reddedildi' },
};

const ReportsPage: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const { isConnected, realtimeReports } = useRealtimeStore();

  const [filter, setFilter] = useState<ReportFilter>({ status: 'PENDING', page: 0, size: 20 });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);

  const { data: rooms = [] } = useQuery({
    queryKey: ['chatRooms'],
    queryFn: getChatRooms,
    staleTime: 30000,
  });

  const { data: reportsData, isLoading, refetch } = useQuery({
    queryKey: ['reports', filter],
    queryFn: () => getReports(filter),
    staleTime: 10000,
    placeholderData: (prev) => prev,
  });

  // Stats by status
  const { data: pendingData } = useQuery({
    queryKey: ['reports', { status: 'PENDING', page: 0, size: 1 }],
    queryFn: () => getReports({ status: 'PENDING', page: 0, size: 1 }),
    staleTime: 30000,
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => resolveReport(id),
    onSuccess: () => {
      messageApi.success('Rapor çözüldü olarak işaretlendi');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: () => messageApi.error('İşlem başarısız'),
  });

  const dismissMutation = useMutation({
    mutationFn: (id: number) => dismissReport(id),
    onSuccess: () => {
      messageApi.success('Rapor reddedildi');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: () => messageApi.error('İşlem başarısız'),
  });

  const handleViewUser = (userId: number, username: string) => {
    setSelectedUser({
      id: userId,
      username,
      email: '',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '',
      totalMessages: 0,
    });
    setUserModalOpen(true);
  };

  const realtimeReportIds = new Set(realtimeReports.map((r) => r.id));
  const allReports = [
    ...realtimeReports.filter((r) => !filter.status || r.status === filter.status),
    ...(reportsData?.content || []).filter((r) => !realtimeReportIds.has(r.id)),
  ];

  const columns: ColumnsType<Report> = [
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: Report['status']) => (
        <Tag color={statusConfig[status].color}>{statusConfig[status].label}</Tag>
      ),
    },
    {
      title: 'Raporlanan Mesaj',
      dataIndex: 'messageContent',
      key: 'messageContent',
      ellipsis: true,
      render: (content: string) => (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true, symbol: 'daha fazla' }}
          style={{ margin: 0 }}
        >
          {content}
        </Paragraph>
      ),
    },
    {
      title: 'Raporlanan Kullanıcı',
      dataIndex: 'reportedUsername',
      key: 'reportedUsername',
      width: 150,
      render: (username: string, record: Report) => (
        <Button
          type="link"
          icon={<UserOutlined />}
          onClick={() => handleViewUser(record.reportedUserId, username)}
          style={{ padding: 0 }}
        >
          {username}
        </Button>
      ),
    },
    {
      title: 'Raporlayan',
      dataIndex: 'reporterUsername',
      key: 'reporterUsername',
      width: 130,
      render: (username: string, record: Report) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleViewUser(record.reporterUserId, username)}
          style={{ padding: 0, color: '#888' }}
        >
          {username}
        </Button>
      ),
    },
    {
      title: 'Oda',
      dataIndex: 'chatRoomName',
      key: 'chatRoomName',
      width: 120,
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: 'Neden',
      dataIndex: 'reason',
      key: 'reason',
      width: 120,
      render: (reason: string) => <Tag>{reason}</Tag>,
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
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
      width: 140,
      render: (_: unknown, record: Report) =>
        record.status === 'PENDING' ? (
          <Space>
            <Popconfirm
              title="Raporu onayla?"
              description="Mesaj silinecek ve kullanıcı uyarılacak."
              onConfirm={() => resolveMutation.mutate(record.id)}
              okText="Onayla"
              cancelText="İptal"
            >
              <Tooltip title="Onayla">
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={resolveMutation.isPending}
                >
                  Onayla
                </Button>
              </Tooltip>
            </Popconfirm>
            <Popconfirm
              title="Raporu reddet?"
              onConfirm={() => dismissMutation.mutate(record.id)}
              okText="Reddet"
              cancelText="İptal"
            >
              <Tooltip title="Reddet">
                <Button
                  size="small"
                  icon={<CloseCircleOutlined />}
                  loading={dismissMutation.isPending}
                >
                  Reddet
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        ) : (
          <Text type="secondary">
            {record.resolvedAt ? dayjs(record.resolvedAt).format('DD/MM HH:mm') : '—'}
          </Text>
        ),
    },
  ];

  return (
    <Layout.Content style={{ padding: 24 }}>
      {contextHolder}
      <Title level={4}>🚨 Raporlanan Mesajlar</Title>

      {/* WebSocket Status */}
      <Alert
        type={isConnected ? 'success' : 'warning'}
        icon={<WifiOutlined />}
        message={
          isConnected
            ? 'Gerçek zamanlı bağlantı aktif — yeni raporlar otomatik güncelleniyor'
            : 'WebSocket bağlantısı kurulamadı — manuel yenileme gerekli'
        }
        style={{ marginBottom: 16 }}
        showIcon
      />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Bekleyen Rapor"
              value={pendingData?.totalElements || 0}
              prefix={<Badge status="warning" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Rapor"
              value={reportsData?.totalElements || 0}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Canlı Rapor"
              value={realtimeReports.length}
              prefix={<WifiOutlined style={{ color: isConnected ? '#52c41a' : '#d9d9d9' }} />}
              valueStyle={{ color: isConnected ? '#52c41a' : undefined }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Select
              value={filter.status}
              style={{ width: '100%' }}
              onChange={(v) => setFilter((prev) => ({ ...prev, status: v, page: 0 }))}
              options={[
                { label: 'Bekleyenler', value: 'PENDING' },
                { label: 'Çözülenler', value: 'RESOLVED' },
                { label: 'Reddedilenler', value: 'DISMISSED' },
              ]}
            />
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              placeholder="Oda filtrele"
              allowClear
              style={{ width: '100%' }}
              onChange={(v) => setFilter((prev) => ({ ...prev, chatRoomId: v, page: 0 }))}
              options={rooms.map((r) => ({ label: r.name, value: r.id }))}
            />
          </Col>
          <Col>
            <Tooltip title="Yenile">
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
            </Tooltip>
          </Col>
        </Row>
      </Card>

      {/* Reports Table */}
      <Card>
        <Table<Report>
          columns={columns}
          dataSource={allReports}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: (filter.page || 0) + 1,
            pageSize: filter.size || 20,
            total: reportsData?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} rapor`,
            onChange: (page, pageSize) =>
              setFilter((prev) => ({ ...prev, page: page - 1, size: pageSize })),
          }}
          rowClassName={(record) =>
            record.status === 'PENDING' ? 'pending-report-row' : ''
          }
          scroll={{ x: 900 }}
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
        .pending-report-row td {
          background-color: #fffbe6 !important;
        }
        .pending-report-row:hover td {
          background-color: #fff1b8 !important;
        }
      `}</style>
    </Layout.Content>
  );
};

export default ReportsPage;
