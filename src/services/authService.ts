// /src/services/authService.ts
import type { User, LoginCredentials, RegisterData } from "@/types/auth";

export class AuthService {
  // Helper to create mock JWT tokens
  private static createMockJWT(userId: string, email: string, role: string): string {
    const header = {
      "alg": "HS256",
      "typ": "JWT"
    };
    
    const payload = {
      "sub": userId,
      "email": email,
      "role": role,
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const mockSignature = btoa("mock_signature_" + Date.now());
    
    return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
  }
  
  static async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation
    if (credentials.email === 'admin@cms.com' && credentials.password === 'admin123') {
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'Admin User',
        role: 'admin',
        department: 'IT',
        lastLogin: new Date(),
        permissions: ['read', 'write', 'delete', 'admin']
      };
      
      return {
        user: mockUser,
        token: this.createMockJWT(mockUser.id, mockUser.email, mockUser.role),
        refreshToken: this.createMockJWT(mockUser.id, mockUser.email, 'refresh')
      };
    }
    
    throw new Error('Invalid credentials');
  }
  
  static async register(data: RegisterData): Promise<{ user: User; token: string; refreshToken: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const mockUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: data.role as User["role"],
      department: data.department,
      lastLogin: new Date(),
      permissions: ['read', 'write']
    };
    
    return {
      user: mockUser,
      token: this.createMockJWT(mockUser.id, mockUser.email, mockUser.role),
      refreshToken: this.createMockJWT(mockUser.id, mockUser.email, 'refresh')
    };
  }
  
  static async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(refreshToken);
    
    return {
      token: this.createMockJWT('1', 'admin@cms.com', 'admin'),
      refreshToken: this.createMockJWT('1', 'admin@cms.com', 'refresh')
    };
  }
  
  static async logout(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}
