# USDT P2P Admin Panel

A comprehensive React + TypeScript Admin Panel for managing a USDT P2P Trading Platform.

## Features

### Authentication
- Admin Login with email/password
- Two-factor authentication support
- Password reset functionality
- Role-based access control

### Dashboard
- Key metrics cards (Total Users, Active Users, Trading Volume, Revenue, Pending KYC, Pending Withdrawals)
- User registration trend charts
- Trading volume analytics
- Revenue charts
- Recent activities feed
- Real-time notifications

### User Management
- Users list with search, filter, sort, and pagination
- User details page with profile info, wallet balances, trading history, KYC documents
- Ban/Unban users
- Reset user passwords
- View user activities

### KYC Verification
- Pending KYC list
- KYC detail view with documents
- Approve/Reject KYC with reason
- KYC statistics

### Wallet Management
- View all user wallets
- Search by user
- Adjust balance (add/deduct) with reason
- Transaction history
- Balance audit

### Order Management
- All orders list with filters
- Order details
- Cancel orders
- Order statistics

### Trade Monitoring
- Active trades list
- Trade details
- Intervene in disputes
- Trade history
- Trade statistics

### Deposit Management
- Pending deposits list
- Deposit details with payment proof
- Approve/Reject deposits
- Deposit history
- Deposit statistics

### Withdrawal Management
- Pending withdrawals list
- Withdrawal details
- Approve/Reject withdrawals
- Withdrawal history
- Withdrawal statistics

### Referral Management
- Referral statistics overview
- All referrals list
- Level-wise breakdown (Level 1, 2, 3)
- Referral earnings
- Adjust referral commission rates

### UPI Management
- All UPI accounts
- Verify/Unverify UPI IDs
- UPI usage statistics

### Bank Account Management
- All bank accounts
- Verify bank accounts
- Bank account statistics

### Notifications Management
- Send notification to all users
- Send notification to specific user
- Notification history

### System Settings
- Trading fees configuration
- Minimum/Maximum order limits
- Referral commission rates (Level 1, 2, 3)
- UPI settings
- Maintenance mode toggle
- Platform settings

### Audit Logs
- Admin action logs
- Filter by admin, action type, date
- Export logs to CSV

### Reports & Analytics
- User growth report
- Trading volume report
- Revenue report
- Referral report
- Export to CSV/Excel

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **React Query** - State management and data fetching
- **React Router v6** - Routing
- **Axios** - API calls
- **Recharts** - Charts and visualizations
- **React Hot Toast** - Notifications
- **Date-fns** - Date formatting
- **Lucide React** - Icons

## Project Structure

```
admin/
├── public/
│   ├── logo.svg
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── layout/       # Layout components (Sidebar, Header, AdminLayout)
│   │   ├── common/       # Common components (StatCard, Pagination, etc.)
│   │   └── charts/       # Chart components
│   ├── pages/            # All page components
│   ├── hooks/            # Custom React Query hooks
│   ├── context/          # React context providers
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions and constants
│   └── styles/           # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd admin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5174`

### Build for Production

```bash
npm run build
```

## API Integration

The admin panel integrates with the following backend endpoints:

- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/profile` - Get admin profile
- `GET /api/admin/users` - List users
- `GET /api/admin/users/:id` - Get user details
- `POST /api/admin/users/:id/ban` - Ban user
- `POST /api/admin/users/:id/unban` - Unban user
- `GET /api/admin/kyc` - List KYC submissions
- `POST /api/admin/kyc/:id/approve` - Approve KYC
- `POST /api/admin/kyc/:id/reject` - Reject KYC
- `GET /api/admin/wallets` - List wallets
- `POST /api/admin/wallets/adjust` - Adjust wallet balance
- `GET /api/admin/orders` - List orders
- `POST /api/admin/orders/:id/cancel` - Cancel order
- `GET /api/admin/trades` - List trades
- `POST /api/admin/trades/:id/resolve` - Resolve trade dispute
- `GET /api/admin/deposits` - List deposits
- `POST /api/admin/deposits/:id/approve` - Approve deposit
- `POST /api/admin/deposits/:id/reject` - Reject deposit
- `GET /api/admin/withdrawals` - List withdrawals
- `POST /api/admin/withdrawals/:id/approve` - Approve withdrawal
- `POST /api/admin/withdrawals/:id/reject` - Reject withdrawal
- `GET /api/admin/referrals` - List referrals
- `GET /api/admin/referrals/stats` - Get referral statistics
- `PUT /api/admin/referrals/rates` - Update referral rates
- `GET /api/admin/upi` - List UPI accounts
- `POST /api/admin/upi/:id/verify` - Verify UPI account
- `GET /api/admin/banks` - List bank accounts
- `POST /api/admin/banks/:id/verify` - Verify bank account
- `GET /api/admin/settings` - Get platform settings
- `PUT /api/admin/settings` - Update platform settings
- `GET /api/admin/stats/dashboard` - Get dashboard statistics
- `GET /api/admin/logs` - Get audit logs

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## License

MIT
