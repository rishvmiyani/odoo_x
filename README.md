# **FleetFlow AI**

FleetFlow AI is a centralized, rule-based digital fleet management platform built to replace inefficient manual logbooks with a scalable, AI-powered logistics command center. The system optimizes the complete lifecycle of a delivery fleet — from vehicle registry and trip dispatching to predictive maintenance, fuel anomaly detection, and financial performance tracking.

Designed for a competitive hackathon environment, FleetFlow AI goes beyond CRUD operations by embedding rule-based AI engines that enhance operational decision-making, improve driver safety compliance, and provide real-time business intelligence. Every layer of the application is production-ready, modular, and built using modern full-stack best practices.

## **Core Objectives**
- Replace manual fleet logbooks with a centralized digital hub

- Optimize vehicle lifecycle and operational cost tracking

- Monitor and improve driver safety performance

- Provide AI-driven predictive insights

- Deliver enterprise-grade analytics and reporting

## **Solution**

FleetFlow AI replaces inefficient manual fleet logbooks with a centralized, rule-based digital platform that intelligently manages vehicles, drivers, trips, maintenance, fuel expenses, and financial performance in one unified system.

The platform enforces strict business rules to prevent operational errors — such as overloading vehicles, assigning expired licenses, or dispatching unavailable assets — ensuring data accuracy and accountability. Real-time dashboards provide complete visibility into fleet utilization, maintenance status, and cargo movement.

What differentiates FleetFlow AI is its built-in AI engines. It predicts upcoming maintenance needs, calculates driver safety scores, detects fuel anomalies using statistical analysis, and forecasts operational costs using trend-based regression. These insights transform fleet management from reactive tracking to proactive decision-making.

## **Tech Stack**

### Frontend

  - Next.js 14 (App Router)
  
  - TypeScript (strict mode)
  
  - Tailwind CSS
  
  - shadcn/ui
  
  - Lucide React (icons only)
  
  - React Hook Form
  
  - Zod validation
  
  - Recharts
  
  - SWR (server state management)
  
  - next-themes (dark mode)

### Backend

  - NextAuth.js v5 (JWT strategy + RBAC)
  
  - PostgreSQL
  
  - Prisma ORM
  
  - REST API via App Router route handlers

### AI & Business Logic

  - Rule-based Predictive Maintenance Engine
  
  - Driver Safety Scoring Algorithm
  
  - Fuel Anomaly Detection (Z-score statistical model)
  
  - Cost Prediction using Linear Regression

### Export & Reporting

  - jsPDF + jspdf-autotable
  
  - papaparse (CSV export)

### Tooling

  - ESLint
  
  - Prettier
  
  - Prisma Studio
  
  - tsx (for seed script)

## **Folder Structure**

```bash
fleetflow-ai/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── dashboard/
│   │   ├── vehicles/
│   │   ├── trips/
│   │   ├── drivers/
│   │   ├── maintenance/
│   │   ├── analytics/
│   │   └── shared/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── validations/
│   │   ├── ai/
│   │   ├── export/
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── middleware.ts
├── .env.local
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

# **Setup guide**
