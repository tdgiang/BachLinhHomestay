import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeBusinessInfo } from './HomeBusinessInfo';

describe('HomeBusinessInfo', () => {
  it('renders the legal company name, tax code, legal representative, and issuer', () => {
    render(<HomeBusinessInfo />);

    expect(screen.getByText('Thông tin doanh nghiệp')).toBeInTheDocument();
    expect(
      screen.getByText('Công ty Cổ phần Sản xuất Thương mại Dịch vụ Bách Linh'),
    ).toBeInTheDocument();
    expect(screen.getByText('0111484606')).toBeInTheDocument();
    expect(
      screen.getByText('Nguyễn Lan Phương — Chức danh: Giám đốc'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Phòng Đăng ký kinh doanh và Tài chính doanh nghiệp — Sở Tài chính TP Hà Nội'),
    ).toBeInTheDocument();
  });

  it('renders the support hotline and email', () => {
    render(<HomeBusinessInfo />);

    expect(screen.getByText(/0931 708 256/)).toBeInTheDocument();
    expect(screen.getByText(/admin@bachlinh\.com\.vn/)).toBeInTheDocument();
  });
});
