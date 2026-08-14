import { Link } from "@tanstack/react-router";

export function RouteError() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="display-2">התוכן לא נטען</h1>
      <p className="mt-4 text-sm text-muted-foreground">אירעה שגיאה בטעינת העמוד. נסו לרענן.</p>
      <Link to="/" className="mt-8 border-b border-foreground pb-1 text-sm">
        חזרה לעמוד הראשי
      </Link>
    </div>
  );
}

export function RouteNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="display-2">העמוד שחיפשתם לא נמצא</h1>
      <Link to="/" className="mt-8 border-b border-foreground pb-1 text-sm">
        חזרה לעמוד הראשי
      </Link>
    </div>
  );
}
