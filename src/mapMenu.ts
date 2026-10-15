export interface MapMenuItem {
  type?: "item" | "separator";
  label?: string;
  action?: (
    rowEl: HTMLDivElement,
    menu?: MapMenu,
  ) => void | Promise<void>;
  iconUrl?: string;
  iconRotationDeg?: number;
  checked?: boolean;
  mark?: "check" | "x" | "minus";
  markColor?: string;
  children?: MapMenuItem[];
}

export class MapMenuSession {
  private doc: Document;
  private menu: MapMenu | null = null;
  private removeGlobalListeners: (() => void) | null = null;

  constructor(doc: Document) {
    this.doc = doc;
  }

  open(
    clientX: number,
    clientY: number,
    items: MapMenuItem[],
  ): void {
    this.close();

    const menu = new MapMenu(this.doc);
    this.menu = menu;
    menu.open(clientX, clientY, items);

    const onPointerDown = (event: PointerEvent): void => {
      if (!this.menu) return;
      if (this.menu.contains(event.target)) return;
      this.close();
    };

    const onContextMenu = (): void => {
      this.close();
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        this.close();
      }
    };

    this.doc.addEventListener("pointerdown", onPointerDown, {
      capture: true,
    });
    this.doc.addEventListener("contextmenu", onContextMenu, {
      capture: true,
    });
    this.doc.addEventListener("keydown", onKeyDown, {
      capture: true,
    });

    this.removeGlobalListeners = () => {
      this.doc.removeEventListener("pointerdown", onPointerDown, true);
      this.doc.removeEventListener("contextmenu", onContextMenu, true);
      this.doc.removeEventListener("keydown", onKeyDown, true);
    };
  }

  close(): void {
    this.removeGlobalListeners?.();
    this.removeGlobalListeners = null;

    this.menu?.destroy();
    this.menu = null;
  }

  destroy(): void {
    this.close();
  }
}

export class MapMenu {
  private doc: Document;
  private root: HTMLDivElement;
  private submenus: HTMLDivElement[] = [];

  constructor(doc: Document) {
    this.doc = doc;
    this.root = this.doc.body.createDiv({ cls: "zm-menu" });
    this.root.addEventListener("contextmenu", (event) => {
      event.stopPropagation();
    });
  }

  open(
    clientX: number,
    clientY: number,
    items: MapMenuItem[],
  ): void {
    this.buildList(this.root, items);
    this.position(this.root, clientX, clientY, "right");
  }

  destroy(): void {
    for (const submenu of this.submenus) {
      submenu.remove();
    }
    this.submenus = [];

    this.root.remove();
  }

  contains(target: EventTarget | null): boolean {
    if (!this.isNode(target)) return false;

    return (
      this.root.contains(target) ||
      this.submenus.some((submenu) => submenu.contains(target))
    );
  }

  private isNode(value: EventTarget | null): value is Node {
    return (
      typeof value === "object" &&
      value !== null &&
      "nodeType" in value
    );
  }

  private buildList(
    container: HTMLDivElement,
    items: MapMenuItem[],
  ): void {
    container.empty();

    for (const item of items) {
      if (item.type === "separator") {
        container.createDiv({ cls: "zm-menu__sep" });
        continue;
      }

      if (!item.label) continue;

      const row = container.createDiv({ cls: "zm-menu__item" });
      const label = row.createDiv({ cls: "zm-menu__label" });

      if (item.iconUrl) {
        const image = label.createEl("img", {
          cls: "zm-menu__icon",
        });
        image.src = item.iconUrl;

        const rotation =
          typeof item.iconRotationDeg === "number" &&
          Number.isFinite(item.iconRotationDeg)
            ? item.iconRotationDeg
            : 0;

        if (rotation) {
          image.style.transform = `rotate(${rotation}deg)`;
        } else {
          image.style.removeProperty("transform");
        }

        label.appendChild(this.doc.createTextNode(" "));
      }

      label.appendText(item.label);

      const right = row.createDiv({ cls: "zm-menu__right" });

      if (item.children?.length) {
        const arrow = right.createDiv({ cls: "zm-menu__arrow" });
        arrow.setText("▶");

        let submenu: HTMLDivElement | null = null;

        const openSubmenu = (): void => {
          if (submenu) return;

          submenu = this.doc.body.createDiv({ cls: "zm-submenu" });
          this.submenus.push(submenu);
          this.buildList(submenu, item.children ?? []);

          const rect = row.getBoundingClientRect();
          const win = this.doc.defaultView ?? window;
          const prefer =
            rect.right + 260 < win.innerWidth ? "right" : "left";

          this.position(
            submenu,
            prefer === "right" ? rect.right : rect.left,
            rect.top,
            prefer,
          );
        };

        const closeSubmenu = (): void => {
          if (!submenu) return;

          submenu.remove();
          this.submenus = this.submenus.filter(
            (candidate) => candidate !== submenu,
          );
          submenu = null;
        };

        row.addEventListener("mouseenter", openSubmenu);
        row.addEventListener("mouseleave", (event) => {
          if (!submenu) return;

          const nextTarget = event.relatedTarget;
          if (this.isNode(nextTarget) && submenu.contains(nextTarget)) {
            return;
          }

          closeSubmenu();
        });

        continue;
      }

      const check = right.createDiv({ cls: "zm-menu__check" });

      if (item.mark) {
        check.setText(this.symbolForMark(item.mark));

        if (item.markColor) {
          check.style.color = item.markColor;
        }
      } else if (typeof item.checked === "boolean") {
        check.setText(item.checked ? "✓" : "");
      }

      if (!item.action) {
        row.classList.add("zm-menu__item--info");
      }

      row.addEventListener("click", () => {
        if (!item.action) return;

        try {
          void Promise.resolve(item.action(row, this)).catch((error) => {
            console.error("Zoom Map menu item action failed:", error);
          });
        } catch (error) {
          console.error("Zoom Map menu item action failed:", error);
        }
      });
    }
  }

  private symbolForMark(mark: "check" | "x" | "minus"): string {
    switch (mark) {
      case "x":
        return "×";
      case "minus":
        return "–";
      default:
        return "✓";
    }
  }

  private position(
    el: HTMLDivElement,
    clientX: number,
    clientY: number,
    prefer: "right" | "left",
  ): void {
    const pad = 6;
    const rect = el.getBoundingClientRect();

    let x = clientX;
    let y = clientY;

    const win = this.doc.defaultView ?? window;
    const viewportWidth = win.innerWidth;
    const viewportHeight = win.innerHeight;

    if (prefer === "right") {
      if (clientX + rect.width + pad > viewportWidth) {
        x = Math.max(pad, viewportWidth - rect.width - pad);
      }
    } else {
      x = clientX - rect.width;
      if (x < pad) x = pad;
    }

    if (clientY + rect.height + pad > viewportHeight) {
      y = Math.max(pad, viewportHeight - rect.height - pad);
    }

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }
}