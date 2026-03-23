import React from 'react';
import { Layout, Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/api';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000,
  });

  const cards = [
    {
      title: 'Toplam Kullanıcı',
      value: stats?.totalUsers,
      prefix: <TeamOutlined />,
      color: '#1677ff',
    },
    {
      title: 'Aktif Kullanıcı',
      value: stats?.activeUsers,
      prefix: <UserOutlined />,
      color: '#52c41a',
    },
    {
      title: 'Toplam Mesaj',
      value: stats?.totalMessages,
      prefix: <MessageOutlined />,
      color: '#722ed1',
    },
    {
      title: 'Bekleyen Rapor',
      value: stats?.pendingReports,
      prefix: <ExclamationCircleOutlined />,
      color: '#faad14',
    },
    {
      title: 'Bugün Yeni Üye',
      value: stats?.newUsersToday,
      prefix: <UserOutlined />,
      color: '#13c2c2',
    },
    {
      title: 'Bugün Mesaj',
      value: stats?.messagesToday,
      prefix: <MessageOutlined />,
      color: '#eb2f96',
    },
  ];

  return (
    <Layout.Content style={{ padding: 24 }}>
      <Title level={4}>📊 Dashboard</Title>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {cards.map((card) => (
            <Col xs={24} sm={12} lg={8} key={card.title}>
              <Card>
                <Statistic
                  title={card.title}
                  value={card.value ?? '—'}
                  prefix={card.prefix}
                  valueStyle={{ color: card.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Layout.Content>
  );
};

export default DashboardPage;
