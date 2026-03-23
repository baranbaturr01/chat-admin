import React from 'react';
import { Layout, Typography, Card } from 'antd';

const { Title, Text } = Typography;

const SettingsPage: React.FC = () => (
  <Layout.Content style={{ padding: 24 }}>
    <Title level={4}>⚙️ Ayarlar</Title>
    <Card>
      <Text type="secondary">Sistem ayarları bu sayfada yer alacak.</Text>
    </Card>
  </Layout.Content>
);

export default SettingsPage;
