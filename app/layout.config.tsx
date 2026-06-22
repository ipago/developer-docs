import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

// Creators module: general product info. Links across to the dev module.
export const creatorsOptions: BaseLayoutProps = {
  nav: { title: "2Pay · Creators" },
  links: [{ text: "Developer docs", url: "/dev" }],
};

// Dev module: integration info. Links across to the creators module.
export const devOptions: BaseLayoutProps = {
  nav: { title: "2Pay · Developers" },
  links: [{ text: "Creator docs", url: "/creators" }],
};
