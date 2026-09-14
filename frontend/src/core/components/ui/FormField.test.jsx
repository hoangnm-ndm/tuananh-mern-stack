import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormField } from "./FormField.jsx";

describe("FormField", () => {
  it("nhan hien thi duoc gan dung voi o nhap", async () => {
    render(<FormField label="Email" name="email" />);

    const input = screen.getByLabelText("Email");
    await userEvent.type(input, "a@b.co");
    expect(input).toHaveValue("a@b.co");
  });

  it("hien thong bao loi voi role=alert cho trinh doc man hinh", () => {
    render(<FormField label="Email" name="email" error="Email khong hop le" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Email khong hop le");
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("khong co loi thi aria-invalid la false", () => {
    render(<FormField label="Email" name="email" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
  });

  it("hien goi y khi chua co loi, va AN goi y khi da co loi", () => {
    const { rerender } = render(
      <FormField label="Mat khau" name="password" hint="Toi thieu 8 ky tu" />,
    );
    expect(screen.getByText("Toi thieu 8 ky tu")).toBeInTheDocument();

    rerender(
      <FormField label="Mat khau" name="password" hint="Toi thieu 8 ky tu" error="Qua ngan" />,
    );
    expect(screen.queryByText("Toi thieu 8 ky tu")).not.toBeInTheDocument();
    expect(screen.getByText("Qua ngan")).toBeInTheDocument();
  });

  it("danh dau bat buoc bang dau sao", () => {
    render(<FormField label="Ten" name="name" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });
});
