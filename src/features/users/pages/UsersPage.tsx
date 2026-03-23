import { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Avatar,
  Space,
  Typography,
  Input,
  Select,
  Card,
  Modal,
  message,
  Tooltip,
} from 'antd';
import {
  UserOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import { usersService } from '../../../shared/services/users.service';
import type { User } from '../../../shared/types';

const { Title, Text } = Typography;
const { Search } = Input;

export const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page],
    queryFn: () => usersService.getUsers(page, 10),
  });

  const banMutation = useMutation({
    mutationFn: usersService.banUser,
    onSuccess: () => {
      message.success('User has been banned successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Failed to ban user');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: usersService.unbanUser,
    onSuccess: () => {
      message.success('User has been unbanned successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Failed to unban user');
    },
  });

  const handleBan = (user: User) => {
    Modal.confirm({
      title: `Ban ${user.username}?`,
      content: `Are you sure you want to ban ${user.username}? They will lose access to the platform.`,
      okText: 'Ban User',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: () => banMutation.mutate(user.id),
    });
  };

  const handleUnban = (user: User) => {
    Modal.confirm({
      title: `Unban ${user.username}?`,
      content: `Are you sure you want to unban ${user.username}? They will regain access to the platform.`,
      okText: 'Unban User',
      okButtonProps: { style: { background: '#52c41a', border: 'none' } },
      cancelText: 'Cancel',
      onOk: () => unbanMutation.mutate(user.id),
    });
  };

  const filteredUsers = (data?.data ?? []).filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnsType<User> = [
    {
      title: 'User',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{
              background:
                record.role === 'admin'
                  ? '#667eea'
                  : record.role === 'moderator'
                  ? '#52c41a'
                  : '#1890ff',
            }}
          />
          <div>
            <Text strong>{record.username}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag
          color={role === 'admin' ? 'purple' : role === 'moderator' ? 'green' : 'blue'}
        >
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag
          color={
            status === 'active' ? 'success' : status === 'banned' ? 'error' : 'default'
          }
          icon={
            status === 'active' ? (
              <CheckCircleOutlined />
            ) : status === 'banned' ? (
              <StopOutlined />
            ) : undefined
          }
        >
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date: string) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <Text type="secondary">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          {record.status === 'banned' ? (
            <Tooltip title="Unban user">
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUnban(record)}
                loading={unbanMutation.isPending}
                style={{ background: '#52c41a', border: 'none' }}
              >
                Unban
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Ban user">
              <Button
                danger
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleBan(record)}
                loading={banMutation.isPending}
                disabled={record.role === 'admin'}
              >
                Ban
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            User Management
          </Title>
          <Text type="secondary">Manage platform users, roles, and access control</Text>
        </div>

        <Card style={{ borderRadius: 12 }}>
          <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }} wrap>
            <Space>
              <Search
                placeholder="Search by username or email..."
                allowClear
                style={{ width: 280 }}
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Select
                defaultValue="all"
                style={{ width: 140 }}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'banned', label: 'Banned' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                suffixIcon={<FilterOutlined />}
              />
            </Space>
            <Text type="secondary">
              Total: {data?.total ?? 0} users
            </Text>
          </Space>

          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 800 }}
            pagination={{
              current: page,
              pageSize: 10,
              total: data?.total ?? 0,
              onChange: setPage,
              showSizeChanger: false,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
            }}
            rowClassName={(record) =>
              record.status === 'banned' ? 'banned-row' : ''
            }
          />
        </Card>
      </Space>
    </div>
  );
};
