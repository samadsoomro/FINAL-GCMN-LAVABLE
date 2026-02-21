import * as React from "react";

const AlertDialog = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
const AlertDialogTrigger = ({ children, asChild, onClick }: any) => (
  <>{children}</>
);
const AlertDialogContent = ({ children, className }: any) => (
  <div
    className={`fixed inset-0 flex items-center justify-center z-50 ${className || ""}`}
    onClick={(e) => e.stopPropagation()}
  >
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">{children}</div>
  </div>
);
const AlertDialogHeader = ({ children }: any) => (
  <div className="mb-4">{children}</div>
);
const AlertDialogFooter = ({ children }: any) => (
  <div className="flex justify-end gap-2 mt-6">{children}</div>
);
const AlertDialogTitle = ({ children }: any) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);
const AlertDialogDescription = ({ children }: any) => (
  <p className="text-sm text-gray-600">{children}</p>
);
const AlertDialogAction = ({ children, onClick }: any) => (
  <button
    onClick={onClick}
    className="bg-destructive text-white px-4 py-2 rounded hover:bg-destructive/90"
  >
    {children}
  </button>
);
const AlertDialogCancel = ({ children, onClick }: any) => (
  <button
    onClick={onClick}
    className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
  >
    {children}
  </button>
);

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
