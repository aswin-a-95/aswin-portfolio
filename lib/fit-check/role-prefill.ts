/**
 * "Talk to Aswin about this role" hands the fit check's role to the contact form (SPEC §5,
 * contact pre-fill). In-page only: nothing is stored.
 */
type Listener = (role: string) => void;
const listeners = new Set<Listener>();

export const rolePrefill = {
  subscribe(cb: Listener): () => void {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  },
  send(role: string): void {
    listeners.forEach((l) => l(role));
  },
};
