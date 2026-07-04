// Invoker Commands (command/commandfor) と dialog closedby は
// Baseline 達成済みだが React 19.2 / @types/react にはまだ型が無いため補完する。
// https://open-ui.org/components/invokers.explainer/
declare module "react" {
  interface ButtonHTMLAttributes<T> {
    commandfor?: string;
    command?:
      | "show-modal"
      | "close"
      | "request-close"
      | "toggle-popover"
      | "show-popover"
      | "hide-popover"
      | (string & {});
  }
  interface DialogHTMLAttributes<T> {
    closedby?: "any" | "closerequest" | "none";
  }
}

export {};
