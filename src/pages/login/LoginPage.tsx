import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { adminLogin } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [messageApi, contextHolder] = message.useMessage();

  const loginMutation = useMutation({
    mutationFn: ({ username, password }: LoginFormValues) => adminLogin(username, password),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      navigate('/dashboard');
    },
    onError: () => {
      messageApi.error('Kullanıcı adı veya şifre hatalı');
    },
  });

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #001529 0%, #003a6c 100%)',
      }}
    >
      {contextHolder}
      <Card style={{ width: 380, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{ margin: 0 }}>
            💬 Chat Admin
          </Title>
          <Text type="secondary">Yönetim Paneli</Text>
        </div>
        <Form
          name="login"
          onFinish={(values: LoginFormValues) => loginMutation.mutate(values)}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Kullanıcı adı gerekli' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Kullanıcı adı" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: 'Şifre gerekli' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Şifre" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loginMutation.isPending}
            >
              Giriş Yap
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
