import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button.jsx";

describe("Button", () => {
  it("hien noi dung va goi onClick khi bam", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Luu lai</Button>);

    await userEvent.click(screen.getByRole("button", { name: "Luu lai" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("dang loading thi bi vo hieu hoa va khong bam duoc", async () => {
    const onClick = vi.fn();
    render(
      <Button isLoading onClick={onClick}>
        Dang gui
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");

    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled chan su kien bam", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Khong bam duoc
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("mac dinh la type=button de khong vo tinh submit form", () => {
    render(<Button>Nut</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("type=submit khi duoc chi dinh ro", () => {
    render(<Button type="submit">Gui</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
