import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Logo from "@/components/Logo";

// The nav title takes a node, so it carries the real wordmark rather than the
// name set in whatever face the docs theme happens to use. The module label
// sits beside it, muted, so the mark stays the thing you read first.
function NavTitle({ module: label }: { module: string }) {
  return (
    <span className="flex items-center gap-2">
      <Logo height={18} />
      <span className="text-[14px] font-medium text-fd-muted-foreground">{label}</span>
    </span>
  );
}

// Creators module: general product info. Links across to the dev module.
export const creatorsOptions: BaseLayoutProps = {
  nav: { title: <NavTitle module="Creators" /> },
  links: [{ text: "Developer docs", url: "/dev" }],
};

// Dev module: integration info. Links across to the creators module.
export const devOptions: BaseLayoutProps = {
  nav: { title: <NavTitle module="Developers" /> },
  links: [{ text: "Creator docs", url: "/creators" }],
};
