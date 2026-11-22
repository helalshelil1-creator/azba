export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}
export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}
export interface FilterOption {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith' | 'in' | 'between';
    value: unknown;
}
export interface QueryOptions {
    page?: number;
    limit?: number;
    sort?: SortOption[];
    filters?: FilterOption[];
    search?: string;
    include?: string[];
    select?: string[];
}
export interface CreateUserDto {
    email: string;
    phone?: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    preferredLang?: string;
}
export interface LoginDto {
    email: string;
    password: string;
    remember?: boolean;
}
export interface AuthResponse {
    user: SafeUser;
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
}
export interface SafeUser {
    id: string;
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: string;
    status: string;
    emailVerified: boolean;
    preferredLang: string;
    createdAt: string;
}
export interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}
export interface CreateProjectDto {
    farmId: string;
    name: string;
    nameEn?: string;
    description?: string;
    animalType: string;
    breed: string;
    breedEn?: string;
    purpose: string;
    startDate?: string;
    expectedEndDate?: string;
    totalShares: number;
    sharePrice: number;
    minSharesPerInvestor?: number;
    maxSharesPerInvestor?: number;
    totalBudget: number;
    expectedReturnRate?: number;
    riskLevel?: string;
    riskDisclosure?: string;
}
export interface ProjectListItem {
    id: string;
    code: string;
    name: string;
    nameEn?: string;
    animalType: string;
    breed: string;
    purpose: string;
    status: string;
    farm: {
        id: string;
        name: string;
        city: string;
        governorate: string;
    };
    sharePrice: number;
    totalShares: number;
    availableShares: number;
    fundedPercent: number;
    expectedReturnRate?: number;
    riskLevel: string;
    startDate?: string;
    expectedEndDate?: string;
    coverImage?: string;
}
export interface ProjectDetail extends ProjectListItem {
    description?: string;
    riskDisclosure?: string;
    totalBudget: number;
    fundedAmount: number;
    minSharesPerInvestor: number;
    maxSharesPerInvestor?: number;
    animals: {
        id: string;
        animalId: string;
        breed: string;
        weight?: number;
        type: string;
    }[];
    expenses: {
        category: string;
        total: number;
    }[];
    timeline: {
        date: string;
        label: string;
    }[];
}
export interface CreateReservationDto {
    projectId: string;
    shareCount: number;
}
export interface ReservationResponse {
    id: string;
    projectId: string;
    shareCount: number;
    totalAmount: number;
    currency: string;
    status: string;
    expiresAt: string;
}
export interface ConfirmInvestmentDto {
    reservationId: string;
    paymentMethod: string;
    acceptContract: boolean;
}
export interface InvestmentSummary {
    id: string;
    contractNumber?: string;
    projectId: string;
    projectName: string;
    shareCount: number;
    sharePrice: number;
    totalAmount: number;
    currentValue?: number;
    realizedProfit: number;
    unrealizedProfit: number;
    totalDistributions: number;
    status: string;
    createdAt: string;
    projectStatus: string;
}
export interface InvestorDashboardStats {
    totalInvested: number;
    portfolioValue: number;
    realizedProfit: number;
    unrealizedProfit: number;
    losses: number;
    totalShares: number;
    activeProjects: number;
    completedProjects: number;
    pendingDistributions: number;
    walletBalance: number;
    walletLocked: number;
}
export interface AdminDashboardStats {
    totalUsers: number;
    totalInvestors: number;
    totalInvestments: number;
    totalInvestedAmount: number;
    totalProjects: number;
    activeProjects: number;
    totalFarms: number;
    totalAnimals: number;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    pendingPayments: number;
    pendingWithdrawals: number;
    openTickets: number;
}
export interface FarmSummary {
    id: string;
    name: string;
    code: string;
    city: string;
    governorate: string;
    status: string;
    totalAnimals: number;
    totalPens: number;
    activeProjects: number;
}
export interface AnimalSummary {
    id: string;
    animalId: string;
    tagNumber?: string;
    type: string;
    breed: string;
    gender: string;
    ageMonths?: number;
    weight?: number;
    healthStatus: string;
    status: string;
    farmName: string;
    penName?: string;
    coverImage?: string;
}
export interface LedgerAccountSummary {
    id: string;
    code: string;
    name: string;
    type: string;
    subType?: string;
    balance: number;
    currency: string;
}
export interface JournalEntrySummary {
    id: string;
    entryNumber: string;
    date: string;
    description: string;
    totalDebit: number;
    totalCredit: number;
    status: string;
    createdBy: string;
}
export interface ProfitLossSummary {
    projectId: string;
    projectName: string;
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    status: string;
}
export interface NotificationItem {
    id: string;
    type: string;
    title: string;
    message: string;
    readAt?: string;
    createdAt: string;
}
export interface TicketSummary {
    id: string;
    ticketNumber: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    assigneeName?: string;
}
