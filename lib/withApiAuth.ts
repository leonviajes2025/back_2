import { requireApiKey } from "@/lib/seguridad";

export function withApiAuth(handler: (...args: any[]) => Promise<any>) {
  return async (...args: any[]) => {
    const request = args[0] as Request | undefined;

    // If no request is provided (legacy handlers or tests), skip auth.
    if (request && request.headers && typeof request.headers.get === "function") {
      try {
        // requireApiKey may throw a Response on failure
        await requireApiKey(request);
      } catch (err) {
        if (err instanceof Response) return err;
        throw err;
      }
    }

    return handler(...args);
  };
}
