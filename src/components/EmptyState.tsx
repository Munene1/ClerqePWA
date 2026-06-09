import Icon from "./Icon";

export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-white p-7 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      <div className="mx-auto mb-2 grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        <Icon name="forum" className="text-lg" />
      </div>
      Start a conversation with your banking assistant.
    </div>
  );
}
