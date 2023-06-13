import { useCopyToClipboard } from "react-use";
import { Theme } from "~/Theme";
import { User } from "~/User";

import { DeleteModal } from "./DeleteModal";

export function Table() {
  const { user, isLoading } = User.use();

  const rows = user?.apiKeys?.map((apiKey, index) => (
    <APIKeyRow
      key={`apiKey-${index}`}
      apiKey={apiKey}
      canDelete={(user?.apiKeys?.length ?? 0) > 1}
    />
  ));

  return (
    <User.Account.Panel className="h-fit w-1/2 grow self-start overflow-x-auto truncate">
      <div className="w-full text-left text-sm text-neutral-500 dark:text-neutral-400">
        <div className="mb-5 flex items-center justify-between text-lg text-neutral-900 dark:text-white">
          <span className="text-lg font-semibold">API keys</span>
          <AddKeyButton />
        </div>

        <div className="grid grid-cols-5 border-b border-white/5 py-3 text-xs uppercase text-neutral-700 dark:text-neutral-400">
          <h1 className="col-span-3 truncate">Key</h1>
          <h1 className="col-span-2 truncate">Date created</h1>
        </div>
        {isLoading ? (
          <LoadingRows count={2} />
        ) : rows?.length === 0 ? (
          <NoDataRow />
        ) : (
          rows
        )}
      </div>
      <hr className="mb-4 h-px border-0 bg-neutral-200 dark:bg-white/5" />
      <div className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">
        Documentation can be found at{" "}
        <a
          href="https://platform.stability.ai/"
          target="_blank"
          className="text-neutral-700 underline dark:text-neutral-400"
          rel="noreferrer"
        >
          platform.stability.ai
        </a>
      </div>
    </User.Account.Panel>
  );
}

function AddKeyButton() {
  const createAPIKey = User.APIKey.Create.use();

  return (
    <Theme.Button
      // outline
      // icon={Theme.Icon.Plus}
      // loading={createAPIKey?.isLoading}
      onClick={() => {
        createAPIKey?.mutate();
      }}
    >
      <Theme.Plus className="mr-2" />
      Create API Key
    </Theme.Button>
  );
}

function APIKeyRow({
  apiKey,
  canDelete,
}: {
  apiKey: User.APIKey;
  canDelete?: boolean;
}) {
  const deleteAPIKey = User.APIKey.Delete.use();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isKeyRevealed, setIsKeyRevealed] = useState(false);

  return (
    <div className="grid w-full grid-cols-5 items-center border-b border-white/5 py-3 last-of-type:border-none">
      <div className="col-span-3 text-left font-mono">
        <div className="truncate">
          {(isKeyRevealed ? apiKey.key : User.APIKey.obscure(apiKey)).replace(
            /\*{3}/g,
            "*"
          )}
        </div>
      </div>
      <div className="text-left">{apiKey.created.toLocaleDateString()}</div>
      <div className="flex justify-end">
        <CopyKey apiKey={apiKey} />
        <ShowHideKey
          isKeyRevealed={isKeyRevealed}
          setIsKeyRevealed={setIsKeyRevealed}
        />
        {canDelete && (
          <>
            <Theme.Button
              // transparent
              className="rounded py-1 text-sm text-white transition-all duration-200 hover:text-red-600"
              onClick={() => setIsConfirmModalOpen(true)}
            >
              <Theme.X />
            </Theme.Button>
            <DeleteModal
              open={isConfirmModalOpen}
              onClose={() => {
                setIsConfirmModalOpen(false);
              }}
              onDelete={() => {
                deleteAPIKey?.mutate({ key: apiKey.key });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

function CopyKey({ apiKey }: { apiKey: User.APIKey }) {
  const [isCopied, setIsCopied] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();

  return (
    <Theme.Tooltip
      delay={250}
      content={isCopied ? "Copied!" : "Copy to clipboard"}
      onChange={(open) => !open && setTimeout(() => setIsCopied(false), 200)}
    >
      <Theme.Button
        // transparent
        onClick={() => {
          copyToClipboard(apiKey.key);
          setIsCopied(true);
        }}
      >
        <Theme.Copy />
      </Theme.Button>
    </Theme.Tooltip>
  );
}

function ShowHideKey({
  isKeyRevealed,
  setIsKeyRevealed,
}: {
  isKeyRevealed: boolean;
  setIsKeyRevealed: (isKeyRevealed: boolean) => void;
}) {
  return (
    <Theme.Button
      onClick={() => setIsKeyRevealed(!isKeyRevealed)}
      // transparent
    >
      {isKeyRevealed ? <Theme.EyeOff /> : <Theme.Eye />}
    </Theme.Button>
  );
}

function LoadingRows({ count }: { count: number }) {
  return (
    <table className="w-full">
      <tbody>
        {Array.from({ length: count }, (_, i) => (
          <Row key={i} isLastRow={i === count - 1}>
            <Cell>
              <Theme.Skeleton className="my-3 h-2.5 w-52" />
            </Cell>

            <Cell>
              <Theme.Skeleton className="my-3 h-2.5 w-14" />
            </Cell>

            <Cell className="flex justify-end">
              <Theme.Skeleton className="my-3 h-2.5 w-14 " />
            </Cell>
          </Row>
        ))}
      </tbody>
    </table>
  );
}

function NoDataRow() {
  return (
    <Row isLastRow>
      <Cell colSpan={3} className={"py-2 text-center"}>
        {"Use the 'Add Key' button above to create an API key."}
      </Cell>
    </Row>
  );
}

function Row({
  children,
  isLastRow,
  className,
}: StyleableWithChildren & {
  isLastRow?: boolean;
}) {
  return (
    <tr
      className={classes(
        "dark:border-white/5",
        !isLastRow && "border-b",
        className
      )}
    >
      {children}
    </tr>
  );
}

function Cell({
  children,
  className,
  colSpan,
}: StyleableWithChildren & {
  colSpan?: number;
}) {
  return (
    <td colSpan={colSpan} className={classes("px-3 py-2", className)}>
      {children}
    </td>
  );
}
