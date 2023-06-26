import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Theme } from "~/Theme";

export function Page() {
  const location = useLocation();
  const navigate = useNavigate();

  // redirect to /account/overview if no subpage is selected
  useEffect(() => {
    if (location.pathname === "/account") {
      navigate("/account/overview");
    }
  }, [location.pathname, navigate]);

  return (
    <div className="mt-6 flex w-full gap-5 px-5">
      <div className="flex w-full max-w-[20rem] flex-col gap-5">
        <div className="bg-brand-amber-1 flex w-full flex-col overflow-hidden rounded-xl">
          <Theme.NavButton
            url="/account/overview"
            active={location.pathname === "/account/overview"}
          >
            Account
          </Theme.NavButton>
          <Theme.NavButton
            url="/account/billing"
            active={location.pathname === "/account/billing"}
          >
            Billing
          </Theme.NavButton>
          <Theme.NavButton
            url="/account/keys"
            active={location.pathname === "/account/keys"}
          >
            API Keys
          </Theme.NavButton>
        </div>
        <div className="bg-brand-amber-1 flex w-full flex-col overflow-hidden rounded-xl">
          <Theme.NavButton url="/logout">Logout</Theme.NavButton>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[80rem] justify-center">
        <Outlet />
      </div>
    </div>
  );
}

export namespace Page {
  export const url = () => "/account" as const;
}
