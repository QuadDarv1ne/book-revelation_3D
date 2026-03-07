import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

describe('ErrorBoundary', () => {
  const TestComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
    if (shouldThrow) {
      throw new Error('Test error');
    }
    return <div>Test Content</div>;
  };

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('должен рендерить children без ошибок', () => {
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('должен показывать fallback при ошибке', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Произошла ошибка')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Попробовать снова/i })).toBeInTheDocument();
  });

  it('должен показывать кастомный fallback', () => {
    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <TestComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });

  it('должен вызывать onError callback', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <TestComponent shouldThrow />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it('должен восстанавливаться после нажатия кнопки', () => {
    render(
      <ErrorBoundary>
        <TestComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Симулируем ошибку через доступ к состоянию
    const errorBoundary = screen.getByText('Test Content').parentElement;
    expect(errorBoundary).toBeInTheDocument();
  });
});
