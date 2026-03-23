import React, { useState } from 'react';
import { Layout, Menu, Typography, Badge, Space, Avatar, Dropdown, Button } from 'antd';
import {
  DashboardOutlined,
  MessageOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  SettingOutlined,
  LogoutOutlined,
  WifiOutlined,
  DisconnectOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRealtimeStore } from '../store/realtimeStore';
import { useWebSocket } from '../shared/hooks/useWebSocket';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isConnected, realtimeReports } = useRealtimeStore();

  // Initialize WebSocket connection
  useWebSocket();

  const pendingReports = realtimeReports.filter((r) => r.status === 'PENDING').length;

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'Kullanıcılar',
    },
    {
      key: '/messages',
      icon: <MessageOutlined />,
      label: 'Mesajlar',
    },
    {
      key: '/reports',
      icon: (
        <Badge count={pendingReports} size="small" offset={[8, 0]}>
          <ExclamationCircleOutlined />
        </Badge>
      ),
      label: (
        <Space>
          Raporlar
          {pendingReports > 0 && <Badge count={pendingReports} size="small" />}
        </Space>
      ),
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar',
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        style={{ background: '#001529' }}
      >
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 8,
          }}
        >
          {!collapsed && (
            <Text strong style={{ color: '#fff', fontSize: 16 }}>
              💬 Chat Admin
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space>
            {isConnected ? (
              <Badge status="processing" color="green">
                <Space>
                  <WifiOutlined style={{ color: '#52c41a' }} />
                  <Text type="success" style={{ fontSize: 12 }}>
                    Canlı
                  </Text>
                </Space>
              </Badge>
            ) : (
              <Space>
                <DisconnectOutlined style={{ color: '#faad14' }} />
                <Text type="warning" style={{ fontSize: 12 }}>
                  Bağlantı yok
                </Text>
              </Space>
            )}
          </Space>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Button type="text">
              <Space>
                <Avatar size="small" icon={<UserOutlined />} />
                <Text>{user?.username || 'Admin'}</Text>
              </Space>
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
