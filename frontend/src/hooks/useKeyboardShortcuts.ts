import { useEffect, useRef } from "react";
import { useApp } from "../context/AppContext";

/**
 * Global keyboard shortcuts for the POS terminal.
 *
 * F          → Focus the product search input
 * ESC        → Clear the current cart
 * P          → Open payment / finalize order (fires a custom event caught by CartPanel)
 * S          → Switch to Register (POS) view
 * K          → Switch to Kitchen display view
 * R          → Switch to Sales Analytics / Reports view
 * I          → Switch to Inventory view
 * U          → Switch to Loyalty / Customers view
 */
export function useKeyboardShortcuts(searchInputRef?: React.RefObject<HTMLInputElement | null>) {
  const { setView, clearCart, user } = useApp();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Ignore when typing inside any input / textarea / contenteditable
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isTyping && e.key !== "Escape") return;

      switch (e.key.toLowerCase()) {
        // ── Search focus ──────────────────────────────────
        case "f":
          if (!isTyping) {
            e.preventDefault();
            searchInputRef?.current?.focus();
          }
          break;

        // ── Clear cart ────────────────────────────────────
        case "escape":
          if (isTyping) {
            // Let the browser blur the active field first
            (document.activeElement as HTMLElement)?.blur();
          } else {
            clearCart();
          }
          break;

        // ── Place order ───────────────────────────────────
        case "p":
          if (!isTyping) {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("pos:open-payment"));
          }
          break;

        // ── Navigation ────────────────────────────────────
        case "s":
          if (!isTyping) setView("pos");
          break;
        case "k":
          if (!isTyping) setView("kitchen");
          break;
        case "r":
          if (!isTyping && (user?.role === "admin" || user?.role === "manager"))
            setView("reports");
          break;
        case "i":
          if (!isTyping && (user?.role === "admin" || user?.role === "manager"))
            setView("inventory");
          break;
        case "u":
          if (!isTyping) setView("customers");
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [setView, clearCart, searchInputRef, user]);
}
