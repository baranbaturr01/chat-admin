import { Row, Col, Card, Statistic, Typography, Space, Alert } from 'antd';
import {
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { dashboardService } from '../../../shared/services/dashboard.service';

const { Title, Text } = Typography;

const messageActivityData = [
  { time: '00:00', messages: 45 },
  { time: '04:00', messages: 12 },
  { time: '08:00', messages: 89 },
  { time: '12:00', messages: 245 },
  { time: '16:00', messages: 312 },
  { time: '20:00', messages: 198 },
  { time: '23:59', messages: 87 },
];

const userActivityData = [
  { day: 'Mon', active: 120, new: 15 },
  { day: 'Tue', active: 145, new: 22 },
  { day: 'Wed', active: 132, new: 18 },
  { day: 'Thu', active: 167, new: 31 },
  { day: 'Fri', active: 198, new: 28 },
  { day: 'Sat', active: 89, new: 12 },
  { day: 'Sun', active: 76, new: 9 },
];

export const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000,
  });

  const statCards = [
    {
      title: 'Online Users',
      value: stats?.onlineUsers ?? 0,
      icon: <UserOutlined />,
      color: '#667eea',
      suffix: 'users',
      trend: '+12%',
    },
    {
      title: 'Active Chats',
      value: stats?.activeChats ?? 0,
      icon: <TeamOutlined />,
      color: '#52c41a',
      suffix: 'rooms',
      trend: '+5%',
    },
    {
      title: 'Total Messages',
      value: stats?.totalMessages ?? 0,
      icon: <MessageOutlined />,
      color: '#1890ff',
      suffix: 'msgs',
      trend: '+23%',
    },
    {
      title: 'Error Logs',
      value: stats?.errorLogs ?? 0,
      icon: <WarningOutlined />,
      color: '#ff4d4f',
      suffix: 'errors',
      trend: '-8%',
    },
    {
      title: 'New Users Today',
      value: stats?.newUsersToday ?? 0,
      icon: <ArrowUpOutlined />,
      color: '#722ed1',
      suffix: 'users',
      trend: '+18%',
    },
    {
      title: 'Banned Users',
      value: stats?.bannedUsers ?? 0,
      icon: <StopOutlined />,
      color: '#fa8c16',
      suffix: 'users',
      trend: '0%',
    },
  ];

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            Dashboard Overview
          </Title>
          <Text type="secondary">Welcome back! Here's what's happening with your chat platform.</Text>
        </div>

        {stats?.errorLogs && stats.errorLogs > 0 ? (
          <Alert
            message={`${stats.errorLogs} error log(s) require your attention`}
            type="warning"
            showIcon
            closable
          />
        ) : null}

        <Row gutter={[16, 16]}>
          {statCards.map((card) => (
            <Col key={card.title} xs={24} sm={12} lg={8} xl={4}>
              <Card
                loading={isLoading}
                style={{ borderRadius: 12, overflow: 'hidden' }}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {card.title}
                    </Text>
                    <Statistic
                      value={card.value}
                      suffix={<Text type="secondary" style={{ fontSize: 12 }}>{card.suffix}</Text>}
                      valueStyle={{ color: card.color, fontSize: 24, fontWeight: 700 }}
                    />
                    <Text style={{ color: card.trend.startsWith('+') ? '#52c41a' : card.trend.startsWith('-') ? '#ff4d4f' : '#666', fontSize: 12 }}>
                      {card.trend} this week
                    </Text>
                  </div>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `${card.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={14}>
            <Card
              title="Message Activity (Today)"
              style={{ borderRadius: 12 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={messageActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="messages"
                    stroke="#667eea"
                    strokeWidth={2}
                    dot={{ fill: '#667eea', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Card
              title="User Activity (This Week)"
              style={{ borderRadius: 12 }}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#667eea" radius={[4, 4, 0, 0]} name="Active" />
                  <Bar dataKey="new" fill="#52c41a" radius={[4, 4, 0, 0]} name="New" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};
