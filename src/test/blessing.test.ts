import { describe, expect, it } from "vitest";
import { blessingSchema } from "@/lib/blessing-schema";

describe("blessing form rules", () => {
  it("rejects an empty message", () => {
    expect(blessingSchema.safeParse({ guest_name: "Ravi", message: "   " }).success).toBe(false);
  });
  it("rejects messages over 500 characters", () => {
    expect(blessingSchema.safeParse({ guest_name: "Ravi", message: "a".repeat(501) }).success).toBe(false);
  });
  it("strips html tags", () => {
    const r = blessingSchema.parse({ guest_name: "<b>Ravi</b>", message: "Happy <script>x</script>home" });
    expect(r.guest_name).toBe("Ravi");
    expect(r.message).toBe("Happy xhome");
  });
});
