export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class ApiService {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('pragati_admin_token');
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json().catch(() => ({
        success: false,
        message: 'Invalid server response.',
      }));

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined') {
          // Token expired or invalid
          if (!endpoint.includes('/auth/login')) {
            localStorage.removeItem('pragati_admin_token');
            localStorage.removeItem('pragati_admin_user');
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        }
        throw new Error(json.message || `Request failed with status ${response.status}`);
      }

      return json;
    } catch (err: any) {
      throw err;
    }
  }

  // --- Auth ---
  async login(credentials: { username: string; password: string }) {
    const res = await this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    const token = res.token || res.data?.token;
    const user = res.user || res.data?.user;

    return {
      ...res,
      token,
      user,
      data: { token, user },
    };
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // --- Users ---
  async getUsers(params: { search?: string; role?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.role && params.role !== 'ALL') q.append('role', params.role);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 10));
    return this.request<any[]>(`/users?${q.toString()}`);
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  async createUser(data: {
    name: string;
    username?: string;
    password?: string;
    role: string;
    mobile?: string;
  }) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, payload: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Analytics ---
  async getAnalytics() {
    return this.request<any>('/analytics');
  }

  // --- Departments ---
  async getDepartments(params: { search?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 50));
    return this.request<any[]>(`/departments?${q.toString()}`);
  }

  async createDepartment(data: { name: string }) {
    return this.request<any>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id: string, data: { name: string }) {
    return this.request<any>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id: string) {
    return this.request<any>(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Doctors ---
  async getDoctors(
    params: { search?: string; department?: string; page?: number; limit?: number } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.department) q.append('department', params.department);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 50));
    return this.request<any[]>(`/doctors?${q.toString()}`);
  }

  async createDoctor(data: {
    firstName: string;
    lastName: string;
    department: string;
    degree: string;
    hospital?: string;
  }) {
    return this.request<any>('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDoctor(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      department?: string;
      degree?: string;
      hospital?: string;
    }
  ) {
    return this.request<any>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDoctor(id: string) {
    return this.request<any>(`/doctors/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Patients ---
  async getPatients(
    params: {
      search?: string;
      department?: string;
      doctorId?: number;
      gender?: string;
      author?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.department) q.append('department', params.department);
    if (params.doctorId) q.append('doctorId', String(params.doctorId));
    if (params.gender) q.append('gender', params.gender);
    if (params.author) q.append('author', params.author);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 10));
    return this.request<any[]>(`/patients?${q.toString()}`);
  }

  async getPatientById(id: string | number) {
    return this.request<any>(`/patients/${id}`);
  }

  async updatePatient(id: string | number, data: any) {
    return this.request<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string | number) {
    return this.request<any>(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Pharmacy ---
  async getPharmacy(
    params: { search?: string; sortBy?: string; order?: string; page?: number; limit?: number } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.sortBy) q.append('sortBy', params.sortBy);
    if (params.order) q.append('order', params.order);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 50));
    return this.request<any[]>(`/pharmacy?${q.toString()}`);
  }

  async createPharmacy(data: { name: string; qty: number }) {
    return this.request<any>('/pharmacy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePharmacy(id: string, data: { name?: string; qty?: number }) {
    return this.request<any>(`/pharmacy/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePharmacy(id: string) {
    return this.request<any>(`/pharmacy/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Diagnosis ---
  async getDiagnosis(params: { search?: string; page?: number; limit?: number } = {}) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 50));
    return this.request<any[]>(`/diagnosis?${q.toString()}`);
  }

  async createDiagnosis(data: { name: string }) {
    return this.request<any>('/diagnosis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDiagnosis(id: string, data: { name: string }) {
    return this.request<any>(`/diagnosis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDiagnosis(id: string) {
    return this.request<any>(`/diagnosis/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Prescriptions (Meds) ---
  async getPrescriptions(
    params: {
      search?: string;
      doctorId?: number;
      patientId?: number;
      pharmacyId?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.doctorId) q.append('doctorId', String(params.doctorId));
    if (params.patientId) q.append('patientId', String(params.patientId));
    if (params.pharmacyId) q.append('pharmacyId', params.pharmacyId);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 10));
    return this.request<any[]>(`/meds?${q.toString()}`);
  }

  async deletePrescription(id: string) {
    return this.request<any>(`/meds/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Tests ---
  async getTests(
    params: {
      search?: string;
      doctorId?: number;
      patientId?: number;
      diagnosisId?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.doctorId) q.append('doctorId', String(params.doctorId));
    if (params.patientId) q.append('patientId', String(params.patientId));
    if (params.diagnosisId) q.append('diagnosisId', params.diagnosisId);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 10));
    return this.request<any[]>(`/tests?${q.toString()}`);
  }

  async deleteTest(id: string) {
    return this.request<any>(`/tests/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Referrals ---
  async getReferrals(
    params: {
      search?: string;
      doctorId?: number;
      patientId?: number;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.doctorId) q.append('doctorId', String(params.doctorId));
    if (params.patientId) q.append('patientId', String(params.patientId));
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 10));
    return this.request<any[]>(`/referrals?${q.toString()}`);
  }

  async deleteReferral(id: string) {
    return this.request<any>(`/referrals/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Volunteers ---
  async getVolunteers(
    params: { search?: string; order?: 'asc' | 'desc'; page?: number; limit?: number } = {}
  ) {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.order) q.append('order', params.order);
    if (params.page) q.append('page', String(params.page));
    if (params.limit) q.append('limit', String(params.limit || 10));
    return this.request<any[]>(`/volunteers?${q.toString()}`);
  }
}

export const api = new ApiService();
