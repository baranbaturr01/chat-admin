import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Tag,
  Button,
  Space,
  Typography,
  Avatar,
  Statistic,
  Row,
  Col,
  Popconfirm,
  message,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  CalendarOutlined,
  MessageOutlined,
  StopOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { banUser, unbanUser, muteUser, unmuteUser } from '../../services/api';
import type { User } from '../../shared/types';

const { Text, Title } = Typography;

interface UserDetailModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

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

const roleColor: Record<User['role'], string> = {
  USER: 'blue',
  ADMIN: 'purple',
  MODERATOR: 'cyan',
};

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, open, onClose }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const queryClient = useQueryClient();
  const [isMuting, setIsMuting] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  };

  const banMutation = useMutation({
    mutationFn: (id: number) => banUser(id, 'Admin action'),
    onSuccess: () => {
      messageApi.success('Kullanıcı banlandı');
      invalidate();
      onClose();
    },
    onError: () => messageApi.error('İşlem başarısız'),
  });

  const unbanMutation = useMutation({
    mutationFn: (id: number) => unbanUser(id),
    onSuccess: () => {
      messageApi.success('Ban kaldırıldı');
      invalidate();
      onClose();
    },
    onError: () => messageApi.error('İşlem başarısız'),
  });

  const muteMutation = useMutation({
    mutationFn: (id: number) => muteUser(id, 60),
    onSuccess: () => {
      messageApi.success('Kullanıcı susturuldu (60 dakika)');
      setIsMuting(false);
      invalidate();
      onClose();
    },
    onError: () => messageApi.error('İşlem başarısız'),
  });

  const unmuteMutation = useMutation({
    mutationFn: (id: number) => unmuteUser(id),
    onSuccess: () => {
      messageApi.success('Susturma kaldırıldı');
      invalidate();
      onClose();
    },
    onError: () => messageApi.error('İşlem başarısız'),
  });

  if (!user) return null;

  const isLoading =
    banMutation.isPending ||
    unbanMutation.isPending ||
    muteMutation.isPending ||
    unmuteMutation.isPending;

  return (
    <>
      {contextHolder}
      <Modal
        title={
          <Space>
            <Avatar size={32} icon={<UserOutlined />} src={user.avatarUrl} />
            <Title level={5} style={{ margin: 0 }}>
              {user.username}
            </Title>
            <Tag color={statusColor[user.status]}>{statusLabel[user.status]}</Tag>
          </Space>
        }
        open={open}
        onCancel={onClose}
        footer={null}
        width={600}
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Statistic
              title="Toplam Mesaj"
              value={user.totalMessages}
              prefix={<MessageOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Kayıt Tarihi"
              value={dayjs(user.createdAt).format('DD/MM/YYYY')}
              prefix={<CalendarOutlined />}
            />
          </Col>
          <Col span={8}>
            <Statistic title="Rol" value=" " prefix={<Tag color={roleColor[user.role]}>{user.role}</Tag>} />
          </Col>
        </Row>

        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label={<><UserOutlined /> Kullanıcı Adı</>}>
            <Text strong>{user.username}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<><MailOutlined /> E-posta</>}>
            {user.email}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined /> Kayıt Tarihi</>}>
            {dayjs(user.createdAt).format('DD MMMM YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={statusColor[user.status]}>{statusLabel[user.status]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Toplam Mesaj">
            {user.totalMessages.toLocaleString('tr-TR')}
          </Descriptions.Item>
        </Descriptions>

        <Space style={{ marginTop: 24, width: '100%', justifyContent: 'flex-end' }}>
          {user.status === 'ACTIVE' && (
            <>
              <Popconfirm
                title="Kullanıcıyı sustur?"
                description="Bu kullanıcı 60 dakika boyunca mesaj gönderemez."
                onConfirm={() => muteMutation.mutate(user.id)}
                okText="Evet, Sustur"
                cancelText="İptal"
              >
                <Button
                  icon={<StopOutlined />}
                  loading={muteMutation.isPending || isMuting}
                  disabled={isLoading}
                >
                  Sustur
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Kullanıcıyı banla?"
                description="Bu kullanıcı platforma erişemez."
                onConfirm={() => banMutation.mutate(user.id)}
                okText="Evet, Banla"
                cancelText="İptal"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<LockOutlined />}
                  loading={banMutation.isPending}
                  disabled={isLoading}
                >
                  Banla
                </Button>
              </Popconfirm>
            </>
          )}
          {user.status === 'MUTED' && (
            <Popconfirm
              title="Susturmayı kaldır?"
              onConfirm={() => unmuteMutation.mutate(user.id)}
              okText="Evet"
              cancelText="İptal"
            >
              <Button
                icon={<CheckCircleOutlined />}
                loading={unmuteMutation.isPending}
                disabled={isLoading}
              >
                Susturmayı Kaldır
              </Button>
            </Popconfirm>
          )}
          {user.status === 'BANNED' && (
            <Popconfirm
              title="Banı kaldır?"
              onConfirm={() => unbanMutation.mutate(user.id)}
              okText="Evet"
              cancelText="İptal"
            >
              <Button
                icon={<CheckCircleOutlined />}
                loading={unbanMutation.isPending}
                disabled={isLoading}
              >
                Banı Kaldır
              </Button>
            </Popconfirm>
          )}
          <Button onClick={onClose}>Kapat</Button>
        </Space>
      </Modal>
    </>
  );
};

export default UserDetailModal;
