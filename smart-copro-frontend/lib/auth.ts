import { axiosInstance } from "./axios-config"

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    role: "SYNDIC" | "RESIDENT" | "CONSEIL" | "TECHNICIEN"
  }
}

// lib/auth.ts

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await axiosInstance.post("/api/users/auth/token/", credentials)
    const token = response.data.token

    // --- LOGIQUE DE DÉTECTION DU RÔLE ---
    // Si ton backend renvoie le role dans response.data.user.role, utilise-le.
    // Sinon, pour tes tests, on détecte selon le username :
    let detectedRole: "SYNDIC" | "RESIDENT" | "CONSEIL" | "TECHNICIEN" = "RESIDENT";

    const usernameLower = credentials.username.toLowerCase();
    if (usernameLower.includes("syndic")) {
      detectedRole = "SYNDIC";
    } else if (usernameLower.includes("tech")) {
      detectedRole = "TECHNICIEN";
    } else if (usernameLower.includes("conseil")) {
      detectedRole = "CONSEIL";
    }

    const mockUser = {
      id: 1,
      username: credentials.username,
      email: credentials.username,
      first_name: "Utilisateur",
      last_name: "PFA",
      role: detectedRole // On utilise le rôle détecté ici !
    }

    localStorage.setItem("authToken", token)
    localStorage.setItem("userRole", mockUser.role)
    localStorage.setItem("userData", JSON.stringify(mockUser))

    return {
      token: token,
      user: mockUser
    }
  },


  logout() {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userRole")
    localStorage.removeItem("userData")
    window.location.href = "/login"
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("authToken")
  },

  getUserRole(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("userRole")
  },

  getUserData() {
    if (typeof window === "undefined") return null
    const data = localStorage.getItem("userData")
    return data ? JSON.parse(data) : null
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}