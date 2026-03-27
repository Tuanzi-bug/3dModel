import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import RegisterPage from '@/app/register/page'

const mockRegister = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({ register: mockRegister }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders register form with email, password, and confirm password fields', () => {
    const { getByLabelText } = render(<RegisterPage />)

    expect(getByLabelText('邮箱')).toBeTruthy()
    expect(getByLabelText('密码')).toBeTruthy()
    expect(getByLabelText('确认密码')).toBeTruthy()
    expect(screen.getByRole('button', { name: '注册' })).toBeTruthy()
  })

  it('renders link to login page', () => {
    const { container } = render(<RegisterPage />)

    const loginLink = container.querySelector('a[href="/login"]')
    expect(loginLink).toBeTruthy()
    expect(loginLink?.textContent).toBe('立即登录')
  })

  it('renders ShelfCraft brand', () => {
    const { getByText } = render(<RegisterPage />)

    expect(getByText('ShelfCraft')).toBeTruthy()
  })

  it('calls register with email and password on submit', async () => {
    mockRegister.mockResolvedValueOnce({})
    const { getByLabelText } = render(<RegisterPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'new@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.change(getByLabelText('确认密码'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: '注册' }))

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('new@example.com', 'password123')
    })
  })

  it('shows error when passwords do not match', async () => {
    const { getByLabelText, getByText } = render(<RegisterPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'new@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'password123' } })
    fireEvent.change(getByLabelText('确认密码'), { target: { value: 'different' } })
    fireEvent.click(screen.getByRole('button', { name: '注册' }))

    await waitFor(() => {
      expect(getByText('两次输入的密码不一致')).toBeTruthy()
    })

    expect(mockRegister).not.toHaveBeenCalled()
  })

  it('shows error message on register failure', async () => {
    mockRegister.mockRejectedValueOnce(new Error('该邮箱已被注册'))
    const { getByLabelText, getByText } = render(<RegisterPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'dup@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'pass123' } })
    fireEvent.change(getByLabelText('确认密码'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: '注册' }))

    await waitFor(() => {
      expect(getByText('该邮箱已被注册')).toBeTruthy()
    })
  })

  it('disables button while loading', async () => {
    mockRegister.mockImplementation(() => new Promise(() => {})) // never resolves
    const { getByLabelText } = render(<RegisterPage />)

    fireEvent.change(getByLabelText('邮箱'), { target: { value: 'new@example.com' } })
    fireEvent.change(getByLabelText('密码'), { target: { value: 'pass123' } })
    fireEvent.change(getByLabelText('确认密码'), { target: { value: 'pass123' } })
    fireEvent.click(screen.getByRole('button', { name: '注册' }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /注册中/ })
      expect(btn).toBeTruthy()
      expect((btn as HTMLButtonElement).disabled).toBe(true)
    })
  })
})
