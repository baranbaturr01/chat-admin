import React, { useState } from 'react';
import {
  Layout,
  Table,
  Input,
  Button,
  Tag,
  Space,
  Typography,
  Tooltip,
  Card,
  message,
} from 'antd';
import { SearchOutlined, UserOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getUsers } from '../../services/api';
import UserDetailModal from '../../components/modals/UserDetailModal';
import type { User } from '../../shared/types';

dayjs.locale('tr');

const { Title } = Typography;

const statusColor: Record<User['status'], string> = {
  ACTIVE: 'green',
  MUTED: 'orange',
  BANNED: 'red',
};

const statusLabel: Record<User['status'], string> = {
  ACTIVE: 'Aktif',
  MUTED: 'Susturulmuş',
  BANNED: 'Banlı',
};

const UsersPage: React.FC = () => {
  const [, contextHolder] = message.useMessage();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['users', { page, size: pageSize, search }],
    queryFn: () => getUsers({ page, size: pageSize, search: search || undefined }),
    placeholderData: (prev) => prev,
  });

  const columns: ColumnsType<User> = [
    {
      title: 'Kullanıcı Adı',
      dataIndex: 'username',
      key: 'username',
      render: (username: string, record: User) => (
        <Button
          type="link"
          icon={<UserOutlined />}
          onClick={() => {
            setSelectedUser(record);
            setModalOpen(true);
          }}
          style={{ padding: 0 }}
        >
          {username}
        </Button>
      ),
    },
    { title: 'E-posta', dataIndex: 'email', key: 'email' },
    {
      title: 'Rol',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role']) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: User['status']) => (
        <Tag color={statusColor[status]}>{statusLabel[status]}</Tag>
      ),
    },
    {
      title: 'Mesaj Sayısı',
      dataIndex: 'totalMessages',
      key: 'totalMessages',
      sorter: (a, b) => a.totalMessages - b.totalMessages,
    },
    {
      title: 'Kayıt Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Aksiyonlar',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Tooltip title="Detay">
          <Button
            size="small"
            icon={<UserOutlined />}
            onClick={() => {
              setSelectedUser(record);
              setModalOpen(true);
            }}
          >
            Detay
          </Button>
        </Tooltip>
      ),
    },
  ];

  return (
    <Layout.Content style={{ padding: 24 }}>
      {contextHolder}
      <Title level={4}>👥 Kullanıcılar</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Kullanıcı ara..."
            allowClear
            style={{ width: 300 }}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
          <Tooltip title="Yenile">
            <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading} />
          </Tooltip>
        </Space>
      </Card>

      <Card>
        <Table<User>
          columns={columns}
          dataSource={data?.content || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: page + 1,
            pageSize,
            total: data?.totalElements || 0,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kullanıcı`,
            onChange: (p, ps) => {
              setPage(p - 1);
              setPageSize(ps);
            },
          }}
          scroll={{ x: 700 }}
        />
      </Card>

      <UserDetailModal
        user={selectedUser}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </Layout.Content>
  );
};

export default UsersPage;
