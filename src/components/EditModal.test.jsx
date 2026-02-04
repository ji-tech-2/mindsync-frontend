import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditModal from './EditModal';

describe('EditModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: "Edit Field",
    onSubmit: mockOnSubmit,
    loading: false,
    message: { type: "", text: "" }
  };

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSubmit.mockClear();
  });

  it('should not render when isOpen is false', () => {
    render(
      <EditModal {...defaultProps} isOpen={false}>
        <div>Content</div>
      </EditModal>
    );

    expect(screen.queryByText("Edit Field")).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <EditModal {...defaultProps}>
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByText("Edit Field")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it('should display modal title', () => {
    render(
      <EditModal {...defaultProps} title="Custom Title">
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(
      <EditModal {...defaultProps}>
        <div>Content</div>
      </EditModal>
    );

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay clicked', () => {
    render(
      <EditModal {...defaultProps}>
        <div>Content</div>
      </EditModal>
    );

    const overlay = screen.getByText("Edit Field").closest('.modal-content').parentElement;
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when modal content clicked', () => {
    render(
      <EditModal {...defaultProps}>
        <div>Content</div>
      </EditModal>
    );

    const modalContent = screen.getByText("Content").closest('.modal-content');
    fireEvent.click(modalContent);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call onSubmit when form submitted', () => {
    render(
      <EditModal {...defaultProps}>
        <input type="text" />
      </EditModal>
    );

    const form = screen.getByRole('button', { name: /update/i }).closest('form');
    fireEvent.submit(form);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('should display success message', () => {
    const message = { type: "success", text: "Update successful!" };
    
    render(
      <EditModal {...defaultProps} message={message}>
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByText("Update successful!")).toBeInTheDocument();
    const messageElement = screen.getByText("Update successful!");
    expect(messageElement).toHaveClass('success');
  });

  it('should display error message', () => {
    const message = { type: "error", text: "Update failed!" };
    
    render(
      <EditModal {...defaultProps} message={message}>
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByText("Update failed!")).toBeInTheDocument();
    const messageElement = screen.getByText("Update failed!");
    expect(messageElement).toHaveClass('error');
  });

  it('should display info message', () => {
    const message = { type: "info", text: "OTP sent!" };
    
    render(
      <EditModal {...defaultProps} message={message}>
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByText("OTP sent!")).toBeInTheDocument();
    const messageElement = screen.getByText("OTP sent!");
    expect(messageElement).toHaveClass('info');
  });

  it('should disable submit button when loading', () => {
    render(
      <EditModal {...defaultProps} loading={true}>
        <div>Content</div>
      </EditModal>
    );

    const submitButton = screen.getByRole('button', { name: /updating/i });
    expect(submitButton).toBeDisabled();
  });

  it('should show "Updating..." text when loading', () => {
    render(
      <EditModal {...defaultProps} loading={true}>
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByText(/updating/i)).toBeInTheDocument();
  });

  it('should derive button text from title', () => {
    render(
      <EditModal {...defaultProps} title="Edit Name">
        <div>Content</div>
      </EditModal>
    );

    expect(screen.getByRole('button', { name: /update name/i })).toBeInTheDocument();
  });

  it('should render children correctly', () => {
    render(
      <EditModal {...defaultProps}>
        <input data-testid="test-input" placeholder="Test Input" />
        <select data-testid="test-select"></select>
      </EditModal>
    );

    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByTestId('test-select')).toBeInTheDocument();
  });
});
