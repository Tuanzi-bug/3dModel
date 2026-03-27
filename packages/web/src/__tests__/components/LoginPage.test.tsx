import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import LoginPage from '@/app/login/page'

const mockLogin = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ login: mockLogin }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders login form with email and password fields', () => {
    const { getByLabelText } = render(<LoginPage />)

    expect(getByLabelText('邮箱')).toBeTruthy()
    expect(getByLabelText('密码')).toBeTruthy()
    expect(screen.getByRole('button', { name: '登录' })).toBeTruthy()
  })

  it('renders link to register page', () => {
    const { container } = render(<LoginPage />)

    const registerLink = container.querySelector('a[href="/register"]')
    expect(registerLink).toBeTruthy()
    expect(registerLink?.textContent).toBe('注册账号')
  })

  it('renders ShelfCraft brand', () => {
    const { getByText } = render(<LoginPage />)

    expect(getByText('ShelfCraft')).toBeTruthy()
  })

  it('calls login with email and password on submit', async () => {
    mockLogin.mockResolvedValueOnce({})
    const { getByLabelText } = render(<LoginPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'test@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('shows error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('邮箱或密码错误'))
    const { getByLabelText, getByText } = render(<LoginPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'bad@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(getByText('邮箱或密码错误')).toBeTruthy()
    })
  })

  it('disables button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(() => {})) // never resolves
    const { getByLabelText } = render(<LoginPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'test@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'pass' } })
    fireEvent.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /登录中/ })
      expect(btn).toBeTruthy()
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    })
  })
})
