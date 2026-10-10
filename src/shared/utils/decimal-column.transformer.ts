import { ValueTransformer } from 'typeorm';

// Mục đích chính: Database lưu DECIMAL, nhưng khi lấy ra trong TypeScript thì muốn nhận được number thay vì string.

export const decimalColumnTransformer: ValueTransformer = {
  to: (value?: number | null) => value, // chạy khi ghi dữ liệu từ TypeScript → Database

  from: (value?: string | number | null) => {
    // chạy khi đọc dữ liệu từ Database → TypeScript
    if (value === null || value === undefined) {
      return null;
    }

    const num = typeof value === 'number' ? value : Number(String(value));
    return Number.isFinite(num) ? num : 0; //có phải là một số hữu hạn
  },
};

export const decimalColumn = {
  type: 'decimal' as const, // Đảm bảo type có kiểu decimal chứ không phải string vì database gửi về là string
  precision: 12,
  scale: 2,
  transformer: decimalColumnTransformer,
};

export const nullableDecimalColumn = {
  ...decimalColumn,
  nullable: true,
};
