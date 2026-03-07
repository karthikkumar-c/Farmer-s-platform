# AI-Based Millet Value Chain Management System

A comprehensive platform for managing the millet value chain with AI-powered features, multi-role dashboards, smart matching, market insights, and dispute resolution.

## 🌾 Overview

This system connects farmers, Self-Help Groups (SHGs), consumers, and administrators in a unified platform to streamline millet production, verification, distribution, and sales. It leverages AI for intelligent matching, market insights, and quality verification.

## ✨ Features

### Multi-Role Dashboards

#### 👨‍🌾 Farmer Dashboard
- Product listing management
- Order tracking
- Payment history
- Dispute management
- Profile management

#### 🤝 SHG (Self-Help Group) Dashboard
- Farmer verification
- Batch management
- Product quality control
- Order fulfillment
- Dispute resolution
- History tracking

#### 👥 Consumer Dashboard
- Browse verified millet products
- Place orders
- Track deliveries
- Payment management
- Raise disputes
- Product reviews

#### 👨‍💼 Admin Dashboard
- User management
- Analytics & insights
- Market insights
- Quality control
- System-wide oversight
- Dispute resolution

### 🤖 AI-Powered Features

- **Smart Matching**: AI-based product recommendations matching consumers with suitable millet products
- **Market Insights**: Real-time market analysis, price trends, and demand forecasting
- **Quality Verification**: AI-assisted quality assessment and verification

### 🔐 Security & Authentication

- Role-based access control
- Firebase authentication
- Secure payment processing
- Data encryption

### 📦 Additional Features

- **Traceability**: Complete supply chain tracking
- **Dispute Management**: Multi-level dispute resolution system
- **Payment Integration**: Secure payment gateway
- **Real-time Updates**: Live order and inventory updates
- **Document Management**: Upload and manage verification documents

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Recharts** - Data visualization

### Backend
- **Node.js** - Server runtime
- **Express** - Web framework
- **Firebase** - Authentication & Database
- **Firebase Storage** - File storage
- **Gemini AI** - AI capabilities

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── dashboard/         # Role-based dashboards
│   │   ├── admin/        # Admin dashboard
│   │   ├── consumer/     # Consumer dashboard
│   │   ├── farmer/       # Farmer dashboard
│   │   └── shg/          # SHG dashboard
│   ├── login/            # Authentication pages
│   └── register/         # Registration pages
├── backend/               # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── config/           # Configuration
├── components/           # Reusable UI components
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── public/              # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Firebase account
- Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/selvapraveenv/AI-Based-Millet-Value-Chain-Management-System.git
   cd AI-Based-Millet-Value-Chain-Management-System
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Configure environment variables**

   Frontend `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   Backend `.env`:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   GEMINI_API_KEY=your_gemini_api_key
   ```

5. **Run the development servers**

   Terminal 1 - Frontend:
   ```bash
   npm run dev
   # Frontend runs on http://localhost:3000
   ```

   Terminal 2 - Backend:
   ```bash
   cd backend
   node server.js
   # Backend runs on http://localhost:5000
   ```

## 📝 Usage

1. **Register** as a Farmer, Consumer, or SHG
2. **Admin** creates admin accounts separately
3. **Login** with appropriate credentials
4. Navigate to your role-specific dashboard
5. Explore features based on your role

### Default Roles

- **Farmer**: List products, manage orders
- **SHG**: Verify products, manage batches
- **Consumer**: Browse and purchase products
- **Admin**: Oversee entire system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Selvapraveen V** - [GitHub](https://github.com/selvapraveenv)

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Google Gemini for AI capabilities
- shadcn/ui for beautiful components
- Next.js team for the amazing framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Made with ❤️ for sustainable millet agriculture**
