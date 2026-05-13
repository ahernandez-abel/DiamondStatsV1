import {
  createContext,
  useContext,
  useState,
} from 'react'

import { loginRequest } from '../api/auth.api'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null)

  const login = async (credentials) => {

    try {

      const res = await loginRequest(credentials)

      localStorage.setItem('token', res.data.token)

      setUser(res.data.user)

      return {
        success: true,
      }

    } catch (error) {

      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Error login',
      }
    }
  }

  const logout = () => {

    localStorage.removeItem('token')

    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}