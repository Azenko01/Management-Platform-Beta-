export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthStore {
  private storageKey = "project-management-auth"

  private getAuthData(): AuthState {
    if (typeof window === "undefined") return { user: null, isAuthenticated: false }

    const stored = localStorage.getItem(this.storageKey)
    if (!stored) return { user: null, isAuthenticated: false }

    try {
      return JSON.parse(stored)
    } catch {
      return { user: null, isAuthenticated: false }
    }
  }

  private saveAuthData(data: AuthState): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.storageKey, JSON.stringify(data))
  }

  getCurrentUser(): User | null {
    return this.getAuthData().user
  }

  isAuthenticated(): boolean {
    return this.getAuthData().isAuthenticated
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simple validation - in real app this would be server-side
    if (!email || !password) {
      return { success: false, error: "Email and password are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    // Create user session
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0],
      createdAt: new Date().toISOString(),
    }

    const authState: AuthState = {
      user,
      isAuthenticated: true,
    }

    this.saveAuthData(authState)
    return { success: true, user }
  }

  async signup(
    email: string,
    password: string,
    name: string,
  ): Promise<{ success: boolean; error?: string; user?: User }> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Simple validation
    if (!email || !password || !name) {
      return { success: false, error: "All fields are required" }
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" }
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return { success: false, error: "Please enter a valid email address" }
    }

    // Create new user
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date().toISOString(),
    }

    const authState: AuthState = {
      user,
      isAuthenticated: true,
    }

    this.saveAuthData(authState)
    return { success: true, user }
  }

  logout(): void {
    this.saveAuthData({ user: null, isAuthenticated: false })
  }

  updateUser(updates: Partial<Omit<User, "id" | "createdAt">>): User | null {
    const authData = this.getAuthData()
    if (!authData.user) return null

    const updatedUser = { ...authData.user, ...updates }
    this.saveAuthData({ ...authData, user: updatedUser })
    return updatedUser
  }
}

export const authStore = new AuthStore()
