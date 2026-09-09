import { createContext, useContext, useEffect, useState, type ReactNode, type AnchorHTMLAttributes } from "react";

const RouteContext = createContext<string>("/");

function normalize(path: string) {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path || "/";
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(() => normalize(window.location.pathname));

  useEffect(() => {
    const onPop = () => setPath(normalize(window.location.pathname));
    window.addEventListener("popstate", onPop);
    window.addEventListener("gig:navigate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("gig:navigate", onPop);
    };
  }, []);

  return <RouteContext.Provider value={path}>{children}</RouteContext.Provider>;
}

export function usePath() {
  return useContext(RouteContext);
}

export function navigate(to: string) {
  const next = normalize(to);
  if (next !== normalize(window.location.pathname)) {
    window.history.pushState({}, "", next);
    window.dispatchEvent(new Event("gig:navigate"));
  }
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string };

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
