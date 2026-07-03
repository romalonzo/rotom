import { type Page, type Locator } from "playwright";

export interface Hints {
  role?: string;
  name?: string;
  text?: string;
  label?: string;
  placeholder?: string;
  testId?: string;
  css?: string;
  xpath?: string;
  exact?: boolean;
}

export interface Resolved {
  locator: Locator;
  strategy: string;
  matches: number;
}

/** Try locator strategies most-robust-first; return the first that matches. */
export async function resolve(p: Page, h: Hints): Promise<Resolved | null> {
  const exact = h.exact ?? false;
  const attempts: Array<{ strategy: string; make: () => Locator }> = [];

  if (h.role && h.name)
    attempts.push({ strategy: `role="${h.role}" name="${h.name}"`, make: () => p.getByRole(h.role as never, { name: h.name, exact }) });
  if (h.testId)
    attempts.push({ strategy: `testId="${h.testId}"`, make: () => p.getByTestId(h.testId as string) });
  if (h.label)
    attempts.push({ strategy: `label="${h.label}"`, make: () => p.getByLabel(h.label as string, { exact }) });
  if (h.placeholder)
    attempts.push({ strategy: `placeholder="${h.placeholder}"`, make: () => p.getByPlaceholder(h.placeholder as string, { exact }) });
  if (h.text)
    attempts.push({ strategy: `text="${h.text}"`, make: () => p.getByText(h.text as string, { exact }) });
  if (h.role && !h.name)
    attempts.push({ strategy: `role="${h.role}"`, make: () => p.getByRole(h.role as never) });
  if (h.css)
    attempts.push({ strategy: `css="${h.css}"`, make: () => p.locator(h.css as string) });
  if (h.xpath)
    attempts.push({ strategy: `xpath`, make: () => p.locator(`xpath=${h.xpath}`) });

  for (const a of attempts) {
    try {
      const loc = a.make();
      const count = await loc.count();
      if (count >= 1) {
        return { locator: count === 1 ? loc : loc.first(), strategy: a.strategy, matches: count };
      }
    } catch {
      // this strategy failed to build/evaluate — fall through to the next
    }
  }
  return null;
}

export async function describe(loc: Locator): Promise<string> {
  try {
    return await loc.evaluate((el) => {
      const e = el as HTMLElement;
      const text = (e.innerText || e.textContent || "").trim().slice(0, 80);
      const r = e.getBoundingClientRect();
      return `<${e.tagName.toLowerCase()}> "${text}" at (${Math.round(r.x)},${Math.round(r.y)}) ${Math.round(r.width)}x${Math.round(r.height)}`;
    });
  } catch {
    return "(element found; details unavailable)";
  }
}
