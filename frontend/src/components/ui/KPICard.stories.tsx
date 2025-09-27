import type { Meta, StoryObj } from '@storybook/react';
import KPICard from './KPICard';

const meta = {
  title: 'UI/KPICard',
  component: KPICard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A card component for displaying key performance indicators with trend indicators and color theming.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['green', 'blue', 'orange', 'red'],
      description: 'Color theme of the card',
    },
    trend: {
      control: 'select',
      options: ['up', 'down', 'neutral'],
      description: 'Trend direction indicator',
    },
  },
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FleetStatus: Story = {
  args: {
    title: 'Total Fleet Status',
    value: '24',
    subtitle: '18 Active, 4 Charging, 2 Maintenance',
    trend: 'up',
    color: 'green',
    icon: '🚛',
  },
};

export const BatteryHealth: Story = {
  args: {
    title: 'Battery Health Overview',
    value: '87.5%',
    subtitle: '92% Overall Health • 22 Healthy Batteries',
    trend: 'up',
    color: 'blue',
    icon: '🔋',
  },
};

export const CostSavings: Story = {
  args: {
    title: 'Monthly Cost Savings',
    value: '₹2,04,000',
    subtitle: 'vs Traditional ICE Fleet • ₹1,00,000 Fuel + ₹1,04,000 Maintenance',
    trend: 'up',
    color: 'green',
    icon: '💰',
  },
};

export const Sustainability: Story = {
  args: {
    title: 'Sustainability Impact',
    value: '8.2 tons CO₂',
    subtitle: '68% Reduction vs ICE Fleet • 24,500 Miles Driven',
    trend: 'up',
    color: 'green',
    icon: '🌱',
  },
};

export const Warning: Story = {
  args: {
    title: 'Maintenance Alerts',
    value: '3',
    subtitle: '2 Due This Week, 1 Overdue',
    trend: 'down',
    color: 'orange',
    icon: '⚠️',
  },
};

export const Critical: Story = {
  args: {
    title: 'Critical Alerts',
    value: '1',
    subtitle: 'Battery Level Below 10%',
    trend: 'down',
    color: 'red',
    icon: '🚨',
  },
};

export const Neutral: Story = {
  args: {
    title: 'System Status',
    value: 'Online',
    subtitle: 'All Systems Operational',
    trend: 'neutral',
    color: 'blue',
    icon: '✅',
  },
};

export const AllColors: Story = {
  args: {
    title: 'All Colors Example',
    value: '100%',
    color: 'green',
    icon: '✅',
  },
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <KPICard
        title="Success Metric"
        value="100%"
        subtitle="Everything is working great"
        trend="up"
        color="green"
        icon="✅"
      />
      <KPICard
        title="Information Metric"
        value="42"
        subtitle="Current active connections"
        trend="neutral"
        color="blue"
        icon="ℹ️"
      />
      <KPICard
        title="Warning Metric"
        value="5"
        subtitle="Items need attention"
        trend="down"
        color="orange"
        icon="⚠️"
      />
      <KPICard
        title="Critical Metric"
        value="2"
        subtitle="Urgent issues detected"
        trend="down"
        color="red"
        icon="🚨"
      />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};