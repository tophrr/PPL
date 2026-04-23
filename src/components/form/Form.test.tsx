import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';

/**
 * Component Tests - Form Component
 * Test form handling, validation, and submission
 */

const Form = ({ onSubmit }: { onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

describe('Form Component', () => {
  it('should render form fields', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<Form onSubmit={mockOnSubmit} />);

    const labels = container.querySelectorAll('label');
    const inputs = container.querySelectorAll('input');
    const button = container.querySelector('button');

    expect(labels.length).toBe(2);
    expect(inputs.length).toBe(2);
    expect(button?.textContent).toBe('Submit');
  });

  it('should update form fields on input change', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<Form onSubmit={mockOnSubmit} />);

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    emailInput.value = 'test@example.com';
    emailInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(emailInput.value).toBe('test@example.com');
  });

  it('should show validation errors on invalid submission', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<Form onSubmit={mockOnSubmit} />);

    const button = container.querySelector('button') as HTMLButtonElement;
    button.click();

    const errorMessages = container.querySelectorAll('.error');
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit valid form data', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<Form onSubmit={mockOnSubmit} />);

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;

    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';

    const button = container.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('should validate email format', () => {
    const mockOnSubmit = vi.fn();
    const { container } = render(<Form onSubmit={mockOnSubmit} />);

    const emailInput = container.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[name="password"]') as HTMLInputElement;

    emailInput.value = 'invalid-email';
    passwordInput.value = 'password123';

    const button = container.querySelector('button') as HTMLButtonElement;
    button.click();

    const errorMessages = container.querySelectorAll('.error');
    expect(errorMessages.length).toBeGreaterThan(0);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});

// Simple render helper
function render(component: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  return { container };
}
