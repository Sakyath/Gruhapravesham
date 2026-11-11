import { z } from "zod";

const clean = (s: string) => s.replace(/<[^>]*>/g, "").trim();

export const blessingSchema = z.object({
  guest_name: z.string().transform(clean).pipe(z.string().min(2, "Please enter your name").max(80, "Name is too long")),
  message: z.string().transform(clean).pipe(z.string().min(3, "Please write a blessing").max(500, "Please keep it under 500 characters")),
  relationship: z.string().transform(clean).pipe(z.string().max(60, "Too long")).optional(),
});
export type BlessingInput = z.input<typeof blessingSchema>;
