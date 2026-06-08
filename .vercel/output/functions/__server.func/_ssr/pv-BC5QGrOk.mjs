import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as DATA_EVENT, g as loadChantiers, h as loadClients, u as updateChantierStatut, i as addClient, j as addChantier, n as notifyUpdate } from "./local-data-CXnsCisz.mjs";
import { I as Input, B as Button } from "./input-BH1plDoj.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
import { S as Select$1, a as SelectValue$1, b as SelectTrigger$1, c as SelectIcon, d as SelectPortal, e as SelectContent$1, f as SelectViewport, g as SelectItem$1, h as SelectItemIndicator, i as SelectItemText, j as SelectScrollUpButton$1, k as SelectScrollDownButton$1, l as SelectLabel$1, m as SelectSeparator$1 } from "../_libs/radix-ui__react-select.mjs";
import { R as Root, b as Trigger, P as Portal, C as Content, a as Close, T as Title, O as Overlay, D as Description } from "../_libs/radix-ui__react-dialog.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useSensors, a as useSensor, D as DndContext, P as PointerSensor, b as useDroppable, c as useDraggable } from "../_libs/dnd-kit__core.mjs";
import { u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, c as createSsrRpc } from "./createSsrRpc-Ddupdfr2.mjs";
import { j as jsPDF } from "../_libs/jspdf.mjs";
import { a as createServerFn } from "./server-6vWT_TeN.mjs";
import "../_libs/seroval.mjs";
import { P as Plus, d as FileText, H as Hammer, j as Clock, k as CircleCheck, l as Circle, F as FilePenLine, m as Sparkles, L as LoaderCircle, n as Send, X, h as ChevronDown, o as Check, g as ChevronUp } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, a as arrayType } from "../_libs/zod.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "fs";
import "path";
import "../_libs/fflate.mjs";
import "../_libs/fast-png.mjs";
import "../_libs/iobuffer.mjs";
import "../_libs/pako.mjs";
import "../_libs/html2canvas.mjs";
import "../_libs/dompurify.mjs";
import "../_libs/canvg.mjs";
import "../_libs/core-js.mjs";
import "../_libs/babel__runtime.mjs";
import "../_libs/raf.mjs";
import "../_libs/performance-now.mjs";
import "../_libs/rgbcolor.mjs";
import "../_libs/svg-pathdata.mjs";
import "../_libs/stackblur-canvas.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
const Textarea = reactExports.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
const Select = Select$1;
const SelectValue = SelectValue$1;
const SelectTrigger = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectTrigger$1,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectIcon, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectTrigger$1.displayName;
const SelectScrollUpButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectScrollUpButton$1,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectScrollUpButton$1.displayName;
const SelectScrollDownButton = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectScrollDownButton$1,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectScrollDownButton$1.displayName;
const SelectContent = reactExports.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectPortal, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectContent$1,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        SelectViewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectContent$1.displayName;
const SelectLabel = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectLabel$1,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectLabel$1.displayName;
const SelectItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SelectItem$1,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemIndicator, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectItem$1.displayName;
const SelectSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SelectSeparator$1,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectSeparator$1.displayName;
const Dialog = Root;
const DialogTrigger = Trigger;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
const ETAPES = [
  { key: "devis_realise", label: "Devis réalisé", statuts: ["devis_envoye", "devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "devis_envoye", label: "Devis envoyé", statuts: ["devis_envoye", "devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "devis_signe", label: "Devis signé", statuts: ["devis_signe", "travaux_en_cours", "pv_a_signer", "termine"] },
  { key: "travaux", label: "Travaux réalisés", statuts: ["pv_a_signer", "termine"] },
  { key: "pv", label: "PV signé", statuts: ["termine"] }
];
const CURRENT_MAP = {
  devis_a_faire: "devis_realise",
  devis_envoye: "devis_envoye",
  devis_signe: "devis_signe",
  travaux_en_cours: "travaux",
  pv_a_signer: "pv",
  termine: ""
};
function DossierDetailDialog({
  open,
  onOpenChange,
  chantier,
  client,
  onGenererPv
}) {
  const currentStep = CURRENT_MAP[chantier.statut];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-2xl", children: client.nom }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: chantier.nature_travaux }),
      chantier.montant_estime != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-primary", children: [
        chantier.montant_estime.toLocaleString("fr-FR"),
        " €"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ol", { className: "relative ml-3 border-l-2 border-border space-y-5 py-3", children: ETAPES.map((etape) => {
      const done = etape.statuts.includes(chantier.statut);
      const current = currentStep === etape.key;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "ml-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: cn(
              "absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full border-2",
              done && "bg-green-600 border-green-600 text-white",
              current && !done && "bg-primary border-primary text-primary-foreground animate-pulse",
              !done && !current && "bg-card border-border text-muted-foreground"
            ),
            children: done ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-3 w-3" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: cn(
              "font-display text-sm",
              done && "text-green-700",
              current && !done && "text-primary font-semibold",
              !done && !current && "text-muted-foreground"
            ),
            children: etape.label
          }
        )
      ] }, etape.key);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: onGenererPv, className: "w-full", size: "lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { className: "h-4 w-4 mr-2" }),
      "Générer le PV de fin de travaux"
    ] })
  ] }) });
}
function SignaturePad({
  value,
  onChange,
  label
}) {
  const canvasRef = reactExports.useRef(null);
  const [drawing, setDrawing] = reactExports.useState(false);
  const isSigned = !!value;
  reactExports.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = value;
    }
  }, []);
  const getPos = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * e.currentTarget.width,
      y: (e.clientY - rect.top) / rect.height * e.currentTarget.height
    };
  };
  const start = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const ctx = e.currentTarget.getContext("2d");
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };
  const move = (e) => {
    if (!drawing) return;
    const ctx = e.currentTarget.getContext("2d");
    const { x, y } = getPos(e);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1A1714";
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const end = (e) => {
    if (!drawing) return;
    setDrawing(false);
    onChange(e.currentTarget.toDataURL("image/png"));
  };
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-[11px] font-bold uppercase tracking-[.06em]",
        style: { color: "#8B847D" },
        children: label
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "canvas",
        {
          ref: canvasRef,
          width: 500,
          height: 160,
          className: "w-full touch-none rounded-[10px] transition-all duration-150",
          style: {
            height: 100,
            border: isSigned ? "1.5px solid #1E8E55" : "1.5px dashed #B7B0A8",
            background: isSigned ? "#F0FAF4" : "white",
            cursor: "crosshair"
          },
          onPointerDown: start,
          onPointerMove: move,
          onPointerUp: end,
          onPointerLeave: end
        }
      ),
      !isSigned && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", style: { width: 20, height: 20, stroke: "#CFC8C0", strokeWidth: 1.5, fill: "none" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18z" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11.5px] font-medium", style: { color: "#B7B0A8" }, children: "Tracez votre signature ici" })
      ] }),
      isSigned && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute top-2 right-2 flex items-center gap-1 text-[11px] font-bold rounded-[6px] px-2 py-[3px]",
          style: { background: "#E7F4EC", color: "#1E8E55" },
          children: "✓ Signé"
        }
      )
    ] }),
    isSigned && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        type: "button",
        onClick: clear,
        className: "text-[11px] font-medium underline transition-colors",
        style: { color: "#8B847D" },
        onMouseEnter: (e) => e.currentTarget.style.color = "#4A453F",
        onMouseLeave: (e) => e.currentTarget.style.color = "#8B847D",
        children: "Effacer la signature"
      }
    )
  ] });
}
function toFrDate$1(iso) {
  if (!iso) return "__________";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}
function generatePvPdf(d) {
  const doc = new jsPDF();
  const margin = 22;
  const maxW = 210 - margin * 2;
  let y = margin;
  const addPage = () => {
    doc.addPage();
    y = margin;
  };
  const checkPage = (needed = 20) => {
    if (y + needed > 275) addPage();
  };
  const text = (txt, size = 11, style = "normal", indent = 0) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(txt, maxW - indent);
    checkPage(lines.length * size * 0.45 + 4);
    doc.text(lines, margin + indent, y, { align: "justify", maxWidth: maxW - indent });
    y += lines.length * (size * 0.45) + 2.5;
  };
  const h = (txt, size = 12, underline = false) => {
    checkPage(12);
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.text(txt, margin, y);
    if (underline) {
      const w = doc.getTextWidth(txt);
      doc.setLineWidth(0.4);
      doc.line(margin, y + 1, margin + w, y + 1);
    }
    y += size * 0.5 + 3;
  };
  const hr = () => {
    checkPage(8);
    doc.setDrawColor(160);
    doc.setLineWidth(0.25);
    doc.line(margin, y, 210 - margin, y);
    doc.setDrawColor(0);
    doc.setLineWidth(0.2);
    y += 6;
  };
  const sigBoxes = (sig1, sig2) => {
    checkPage(48);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text("Le maître de l'ouvrage", margin, y);
    doc.text("L'entreprise", 127, y);
    y += 4;
    if (sig1) {
      try {
        doc.addImage(sig1, "PNG", margin, y, 75, 32);
      } catch {
      }
    }
    if (sig2) {
      try {
        doc.addImage(sig2, "PNG", 125, y, 75, 32);
      } catch {
      }
    }
    doc.setDrawColor(140);
    doc.rect(margin, y, 75, 32);
    doc.rect(125, y, 75, 32);
    doc.setDrawColor(0);
    y += 38;
  };
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.text("PROCÈS-VERBAL DE RÉCEPTION DES TRAVAUX", 105, y, { align: "center" });
  y += 6;
  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.text("CAPEB Adour-Pyrénées — Espace Artisan", 105, y, { align: "center" });
  y += 10;
  hr();
  h("Réception des travaux", 12);
  y += 1;
  const dateMarche = toFrDate$1(d.dateMarche);
  const dateEffet = toFrDate$1(d.dateEffet);
  const dateSig = toFrDate$1(d.dateSignature);
  const lieu = d.lieu || "__________";
  const n = d.nbExemplaires ?? 2;
  const repr = d.representant ?? d.entreprise;
  text(
    `Je soussigné(e) ${d.clientNom}, maître de l'ouvrage, après avoir procédé à la visite des travaux effectués par ${d.entreprise}, au titre du marché en date du ${dateMarche} et relatif à ${d.natureTravaux}, en présence du représentant de ${repr} (l'entreprise et le maître d'œuvre le cas échéant).`
  );
  y += 2;
  text("Déclare que :", 11, "bold");
  y += 1;
  if (d.typeReception === "sans_reserve") {
    text(`— la réception est prononcée SANS réserve avec effet en date du ${dateEffet}.`, 11, "normal", 5);
  } else {
    text(
      `— la réception est prononcée AVEC réserve avec effet en date du ${dateEffet}, assortie des réserves mentionnées ci-dessous.`,
      11,
      "normal",
      5
    );
    y += 3;
    h("État des réserves", 11, true);
    text(`Nature des réserves : ${d.reservesNature || "__________"}`, 11, "normal", 5);
    y += 2;
    text(`Travaux à exécuter : ${d.reservesTravaux || "__________"}`, 11, "normal", 5);
    y += 3;
    text(
      `L'entreprise et le maître d'ouvrage conviennent que les travaux nécessités par les réserves seront exécutés dans un délai global de ${d.reservesDelai || "__________"} à compter de ce jour.`
    );
  }
  y += 4;
  text(`Fait à ${lieu}, le ${dateSig}, en ${n} exemplaires dont un remis à chacune des parties.`);
  y += 6;
  sigBoxes(d.signatureClient, d.signatureEntreprise);
  if (d.typeReception === "avec_reserve") {
    y += 8;
    hr();
    h("Procès-verbal de levée des réserves", 12);
    y += 1;
    text(
      `Le maître de l'ouvrage et l'entreprise constatent qu'il a été valablement remédié aux réserves mentionnées dans le PV de réception en date du ${dateEffet}.`
    );
    y += 4;
    text(`Fait à ${lieu}, le __________, en ${n} exemplaires dont un remis à chaque signataire.`);
    y += 6;
    sigBoxes(null, null);
  }
  return doc;
}
const reformulerReserves = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  texte: stringType().min(3).max(2e3)
}).parse(input)).handler(createSsrRpc("b3fb65dda702ca1be5bf069805d390f4f1d8e75719f576416045dc6b3b17e9cc"));
const envoyerPvParEmail = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  destinataires: arrayType(stringType().email()).min(1).max(5),
  sujet: stringType().min(1).max(200),
  message: stringType().min(1).max(5e3),
  pdfBase64: stringType().min(1),
  pdfNom: stringType().min(1).max(200)
}).parse(input)).handler(createSsrRpc("a19ff3c136f8fdabb531ec75b75b284cbf8c38c3d4663f48323f57800f1c02fc"));
function AiField({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "span",
    {
      className: "inline-flex items-center gap-1 font-semibold rounded-[3px] px-[5px] py-[1px] align-baseline",
      style: {
        background: "#FCE7E9",
        color: "#A30012",
        borderBottom: "1.5px solid #E2001A"
      },
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: "text-[8px] font-bold uppercase tracking-wider rounded px-[4px] py-[1px]",
            style: { background: "#E2001A", color: "#fff" },
            children: "IA"
          }
        )
      ]
    }
  );
}
function toFrDate(iso) {
  if (!iso) return "__________";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
function cityFromAdresse$1(adr) {
  if (!adr) return "—";
  const parts = adr.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    return last.replace(/^\d{5}\s*/, "").trim() || last;
  }
  return adr;
}
function PvDocumentDialog({
  open,
  onOpenChange,
  chantier,
  client
}) {
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const todayFr = toFrDate(today);
  const [typeReception, setType] = reactExports.useState("sans_reserve");
  const [dateEffet, setDateEffet] = reactExports.useState(today);
  const [reservesNature, setRN] = reactExports.useState("");
  const [reservesTravaux, setRT] = reactExports.useState("");
  const [reservesDelai, setRD] = reactExports.useState("");
  const [aiInput, setAiInput] = reactExports.useState("");
  const [sigClient, setSigClient] = reactExports.useState(null);
  const [sigEnt, setSigEnt] = reactExports.useState(null);
  const [emailClient, setEmailClient] = reactExports.useState(client.email ?? "");
  const [confirmation, setConfirmation] = reactExports.useState(null);
  const reformuler = useServerFn(reformulerReserves);
  const envoyer = useServerFn(envoyerPvParEmail);
  const aiMut = useMutation({
    mutationFn: async () => reformuler({ data: { texte: aiInput } }),
    onSuccess: (r) => {
      if (r.nature) setRN(r.nature);
      if (r.travaux) setRT(r.travaux);
      toast.success("Réserves reformulées par l'IA");
    },
    onError: (e) => toast.error(e.message)
  });
  const entreprise = "—";
  const lieu = cityFromAdresse$1(client.adresse);
  const dateMarche = chantier.date_creation?.slice(0, 10) ?? today;
  const buildPdf = () => generatePvPdf({
    entreprise,
    clientNom: client.nom,
    clientAdresse: client.adresse,
    natureTravaux: chantier.nature_travaux,
    typeReception,
    dateEffet,
    reservesNature: typeReception === "avec_reserve" ? reservesNature : null,
    reservesTravaux: typeReception === "avec_reserve" ? reservesTravaux : null,
    reservesDelai: typeReception === "avec_reserve" ? reservesDelai : null,
    lieu,
    dateSignature: today,
    dateMarche,
    representant: entreprise,
    nbExemplaires: 2,
    signatureClient: sigClient,
    signatureEntreprise: sigEnt
  });
  const finaliser = useMutation({
    mutationFn: async () => {
      updateChantierStatut(chantier.id, "termine");
      notifyUpdate();
      const doc = buildPdf();
      const fileName = `PV-${client.nom.replace(/\s+/g, "_")}-${today}.pdf`;
      doc.save(fileName);
      const destinataires = [emailClient].filter((x) => typeof x === "string" && x.includes("@"));
      let emailSent = false;
      if (destinataires.length > 0) {
        const pdfBase64 = doc.output("datauristring").split(",")[1];
        const result = await envoyer({
          data: {
            destinataires,
            sujet: `PV de réception – ${client.nom} – ${todayFr}`,
            message: `Bonjour,

Veuillez trouver ci-joint le procès-verbal de réception des travaux signé le ${todayFr}.

Cordialement,
${entreprise}`,
            pdfBase64,
            pdfNom: fileName
          }
        });
        emailSent = result.sent;
      }
      return { destinataires, emailSent };
    },
    onSuccess: ({ destinataires, emailSent }) => {
      setConfirmation({ destinataires, emailSent });
    },
    onError: (e) => toast.error(e.message)
  });
  const close = () => {
    setConfirmation(null);
    onOpenChange(false);
  };
  const canSend = !!sigClient && !!sigEnt && !finaliser.isPending;
  const emailManquant = !emailClient.includes("@");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange: (o) => o ? onOpenChange(true) : close(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      className: "max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0\n          [&>button:last-of-type]:text-white\n          [&>button:last-of-type]:top-[22px]\n          [&>button:last-of-type]:right-5\n          [&>button:last-of-type]:opacity-90\n          [&>button:last-of-type]:hover:opacity-100",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "sr-only", children: "Procès-verbal de réception des travaux" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "flex items-center px-6 py-5 sticky top-0 z-10",
            style: { background: "linear-gradient(180deg,#EA1227,#D2001A)" },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[18px] text-white uppercase tracking-[.03em] leading-tight", children: "Procès-verbal de réception des travaux" })
          }
        ),
        confirmation ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-8 space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-start gap-4 rounded-[14px] border p-5",
              style: { background: "#E7F4EC", borderColor: "#c6e6d2" },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-6 w-6 flex-shrink-0 mt-0.5", style: { color: "#1E8E55" } }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { color: "#15693E" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[15px] uppercase tracking-wide font-semibold mb-2", children: "PV signé — Chantier passé en « Terminé »" }),
                  confirmation.emailSent && confirmation.destinataires.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px]", children: [
                    "PDF envoyé automatiquement à :",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: confirmation.destinataires.join(", ") })
                  ] }) : confirmation.destinataires.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px]", children: [
                    "PDF téléchargé.",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-80", children: "Configurez l'envoi email dans Lovable Cloud pour l'automatiser." })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[13px]", children: [
                    "PDF téléchargé.",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-80", children: "Ajoutez les emails dans les fiches pour l'envoi automatique." })
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: close, className: "btn-capeb w-full flex items-center justify-center", children: "Fermer" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "mx-5 my-5 rounded-[12px] border border-[#ECE7E1] bg-white",
              style: {
                padding: "32px 36px",
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: 14.5,
                lineHeight: 1.85,
                color: "#222",
                boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)"
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "h2",
                  {
                    className: "text-center font-bold mb-1",
                    style: { fontFamily: "Georgia, serif", fontSize: 18, textTransform: "uppercase", letterSpacing: ".04em" },
                    children: "Réception des travaux"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[12px] italic mb-6", style: { color: "#8B847D", fontFamily: "inherit" }, children: "Procès-verbal CAPEB Adour-Pyrénées" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-[11px] mb-5 font-sans not-italic", style: { color: "#8B847D" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: "inline-block rounded px-1.5 py-[2px] text-[8px] font-bold uppercase tracking-wider",
                        style: { background: "#E2001A", color: "#fff" },
                        children: "IA"
                      }
                    ),
                    "= Pré-rempli automatiquement (modifiable)"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "border-b border-dashed border-gray-400 w-8 inline-block" }),
                    "= À compléter"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-justify", children: [
                  "Je soussigné(e)",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: client.nom }),
                  ", maître de l'ouvrage, après avoir procédé à la visite des travaux effectués par",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: entreprise }),
                  ", au titre du marché en date du",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: toFrDate(dateMarche) }),
                  " ",
                  "et relatif à",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: chantier.nature_travaux }),
                  ", en présence du représentant de",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: entreprise }),
                  " ",
                  "(l'entreprise et le maître d'œuvre le cas échéant)."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 font-bold", children: "Déclare que :" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-3 rounded-[12px] p-4 space-y-3",
                    style: {
                      border: "2px dashed #ECE7E1",
                      background: "#FAFAF9"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "text-[11px] font-bold uppercase tracking-[.08em] mb-2 font-sans",
                          style: { color: "#8B847D" },
                          children: "À compléter par l'artisan"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer text-[14.5px]", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "radio",
                            name: "typeRec",
                            checked: typeReception === "sans_reserve",
                            onChange: () => setType("sans_reserve"),
                            className: "mt-1.5 cursor-pointer",
                            style: { accentColor: "#E2001A", width: 16, height: 16, flexShrink: 0 }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "(A) la réception est prononcée ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "SANS réserve" }),
                          " avec effet en date du",
                          " ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "date",
                              value: dateEffet,
                              onChange: (e) => setDateEffet(e.target.value),
                              className: "outline-none focus:border-[#E2001A]",
                              style: {
                                fontFamily: "Georgia, serif",
                                fontSize: 14,
                                borderBottom: "1.5px solid #4A453F",
                                background: "transparent",
                                padding: "0 4px"
                              }
                            }
                          ),
                          " ",
                          ";"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-3 cursor-pointer text-[14.5px]", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "radio",
                            name: "typeRec",
                            checked: typeReception === "avec_reserve",
                            onChange: () => setType("avec_reserve"),
                            className: "mt-1.5 cursor-pointer",
                            style: { accentColor: "#E2001A", width: 16, height: 16, flexShrink: 0 }
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "(B) la réception est prononcée avec effet en date du",
                          " ",
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "date",
                              value: dateEffet,
                              onChange: (e) => setDateEffet(e.target.value),
                              className: "outline-none focus:border-[#E2001A]",
                              style: {
                                fontFamily: "Georgia, serif",
                                fontSize: 14,
                                borderBottom: "1.5px solid #4A453F",
                                background: "transparent",
                                padding: "0 4px"
                              }
                            }
                          ),
                          ", assortie des réserves mentionnées ci-dessous."
                        ] })
                      ] })
                    ]
                  }
                ),
                typeReception === "avec_reserve" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "h3",
                    {
                      className: "font-bold",
                      style: {
                        fontFamily: "Georgia, serif",
                        fontSize: 15,
                        borderBottom: "1.5px solid #222",
                        paddingBottom: 3
                      },
                      children: "État des réserves"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "div",
                    {
                      className: "rounded-[10px] p-3 space-y-2 font-sans not-italic",
                      style: {
                        background: "#FCE7E9",
                        border: "1px solid rgba(226,0,26,.2)"
                      },
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "div",
                          {
                            className: "flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider",
                            style: { color: "#E2001A" },
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5" }),
                              "Aide IA — décrivez le problème en une phrase"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          Textarea,
                          {
                            value: aiInput,
                            onChange: (e) => setAiInput(e.target.value),
                            rows: 2,
                            placeholder: "ex : la peinture du salon présente des coulures et il manque les plinthes…",
                            className: "font-sans text-sm bg-white border-[#ECE7E1]"
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => aiMut.mutate(),
                            disabled: !aiInput.trim() || aiMut.isPending,
                            className: "flex items-center gap-2 text-[12px] font-semibold rounded-[8px] border px-3 py-1.5 transition-colors disabled:opacity-50",
                            style: {
                              background: "rgba(226,0,26,.08)",
                              borderColor: "rgba(226,0,26,.4)",
                              color: "#A30012"
                            },
                            onMouseEnter: (e) => !aiMut.isPending && (e.currentTarget.style.background = "rgba(226,0,26,.15)"),
                            onMouseLeave: (e) => e.currentTarget.style.background = "rgba(226,0,26,.08)",
                            children: [
                              aiMut.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3 w-3" }),
                              "Reformuler avec l'IA"
                            ]
                          }
                        )
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 font-sans not-italic", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[13px] font-bold", style: { fontFamily: "Georgia, serif" }, children: "Nature des réserves" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Textarea,
                        {
                          value: reservesNature,
                          onChange: (e) => setRN(e.target.value),
                          rows: 3,
                          className: "mt-1",
                          style: { fontFamily: "Georgia, serif" },
                          placeholder: "Décrivez les défauts constatés…"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[13px] font-bold", style: { fontFamily: "Georgia, serif" }, children: "Travaux à exécuter" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Textarea,
                        {
                          value: reservesTravaux,
                          onChange: (e) => setRT(e.target.value),
                          rows: 3,
                          className: "mt-1",
                          style: { fontFamily: "Georgia, serif" },
                          placeholder: "Décrivez les travaux de reprise nécessaires…"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-[13px] font-bold", style: { fontFamily: "Georgia, serif" }, children: "Délai d'exécution des réserves" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          value: reservesDelai,
                          onChange: (e) => setRD(e.target.value),
                          placeholder: "ex : 15 jours",
                          className: "mt-1",
                          style: { fontFamily: "Georgia, serif" }
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    "L'entreprise et le maître d'ouvrage conviennent que les travaux nécessités par les réserves seront exécutés dans un délai global de",
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: reservesDelai || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { borderBottom: "1px dashed #999", padding: "0 24px" } }) }),
                    " ",
                    "à compter de ce jour."
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6", children: [
                  "Fait à ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: lieu }),
                  ", le ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: todayFr }),
                  ", en",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: "2" }),
                  " exemplaires dont un remis à chacune des parties."
                ] }),
                emailManquant && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-4 rounded-[10px] p-3 space-y-2 font-sans not-italic",
                    style: {
                      background: "#FBF1DE",
                      border: "1px solid #f0dca8"
                    },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12.5px] font-semibold", style: { color: "#8a6d1f" }, children: "⚠️ Email du client manquant — à saisir pour l'envoi automatique du PDF" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Input,
                        {
                          type: "email",
                          value: emailClient,
                          onChange: (e) => setEmailClient(e.target.value),
                          placeholder: "email@client.fr",
                          className: "font-sans bg-white"
                        }
                      )
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 grid md:grid-cols-2 gap-6 font-sans not-italic", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SignaturePad,
                    {
                      label: "Le maître de l'ouvrage",
                      value: sigClient,
                      onChange: setSigClient
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SignaturePad,
                    {
                      label: "L'entreprise",
                      value: sigEnt,
                      onChange: setSigEnt
                    }
                  )
                ] }),
                typeReception === "avec_reserve" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: "mt-10 pt-6",
                    style: { borderTop: "2px dashed #CCC" },
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "h2",
                        {
                          className: "text-center font-bold mb-4 uppercase",
                          style: {
                            fontFamily: "Georgia, serif",
                            fontSize: 16,
                            letterSpacing: ".04em"
                          },
                          children: "Procès-verbal de levée des réserves"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-justify", children: [
                        "Le maître de l'ouvrage et l'entreprise",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: entreprise }),
                        " ",
                        "constatent qu'il a été valablement remédié aux réserves mentionnées dans le PV de réception en date du ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: toFrDate(dateEffet) }),
                        "."
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "p",
                        {
                          className: "mt-2 text-[12.5px] italic font-sans not-italic",
                          style: { color: "#8B847D" },
                          children: "Ce document sera signé ultérieurement, une fois les réserves levées. Il figure déjà dans le PDF généré."
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3", children: [
                        "Fait à ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: lieu }),
                        ", le",
                        " ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "span",
                          {
                            className: "inline-block",
                            style: { borderBottom: "1px dashed #999", minWidth: 80, padding: "0 4px" },
                            children: " "
                          }
                        ),
                        ", en ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(AiField, { children: "2" }),
                        " exemplaires dont un remis à chaque signataire."
                      ] })
                    ]
                  }
                )
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-6 flex flex-wrap items-center justify-between gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => buildPdf().save(`PV-${client.nom}-${today}.pdf`),
                className: "flex items-center gap-2 text-[13px] font-semibold rounded-[10px] px-4 py-[10px] border border-[#ECE7E1] hover:border-[#E2DCD4] transition-colors",
                style: { background: "white", color: "#4A453F", boxShadow: "0 1px 2px rgba(26,23,20,.05)" },
                children: "Aperçu PDF"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              (!sigClient || !sigEnt) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12px]", style: { color: "#8B847D" }, children: !sigClient && !sigEnt ? "Les 2 signatures manquent" : !sigClient ? "Signature client manquante" : "Signature artisan manquante" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  disabled: !canSend,
                  onClick: () => finaliser.mutate(),
                  className: "btn-capeb flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed",
                  children: [
                    finaliser.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { style: { width: 18, height: 18 }, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { style: { width: 18, height: 18 } }),
                    "Signer & envoyer"
                  ]
                }
              )
            ] })
          ] })
        ] })
      ]
    }
  ) });
}
const STATUTS = [{
  value: "devis_a_faire",
  label: "Devis à faire",
  dotColor: "#8B847D",
  chipBg: "#F1EFED",
  chipColor: "#6B6560"
}, {
  value: "devis_envoye",
  label: "Devis envoyé",
  dotColor: "#2563C9",
  chipBg: "#E8EFFB",
  chipColor: "#1E4FA3"
}, {
  value: "devis_signe",
  label: "Devis signé",
  dotColor: "#6D4AC4",
  chipBg: "#EEE9FA",
  chipColor: "#4F33A0"
}, {
  value: "travaux_en_cours",
  label: "Travaux en cours",
  dotColor: "#D98A00",
  chipBg: "#FBF1DE",
  chipColor: "#9A6200"
}, {
  value: "pv_a_signer",
  label: "PV à signer",
  dotColor: "#E2001A",
  chipBg: "#FCE7E9",
  chipColor: "#A30012"
}, {
  value: "termine",
  label: "Terminé",
  dotColor: "#1E8E55",
  chipBg: "#E7F4EC",
  chipColor: "#15693E"
}];
const AVATAR_COLORS = ["#C30016", "#2563C9", "#7B2D8E", "#0E7C66", "#B45309", "#D97706", "#1D4ED8", "#059669"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initiales(name) {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2);
}
function cityFromAdresse(adresse) {
  if (!adresse) return "";
  return adresse.split(",").pop()?.trim() ?? "";
}
function loadAll() {
  return {
    clients: loadClients(),
    chantiers: loadChantiers()
  };
}
function PvPage() {
  const [openNew, setOpenNew] = reactExports.useState(false);
  const [openDossier, setOpenDossier] = reactExports.useState(null);
  const [openPv, setOpenPv] = reactExports.useState(null);
  const [{
    clients,
    chantiers
  }, setData] = reactExports.useState(loadAll);
  reactExports.useEffect(() => {
    const refresh = () => setData(loadAll());
    window.addEventListener(DATA_EVENT, refresh);
    return () => window.removeEventListener(DATA_EVENT, refresh);
  }, []);
  const stats = reactExports.useMemo(() => {
    const enAttente = chantiers.filter((c) => ["devis_a_faire", "devis_envoye"].includes(c.statut)).length;
    const enCours = chantiers.filter((c) => ["devis_signe", "travaux_en_cours"].includes(c.statut)).length;
    const aSigner = chantiers.filter((c) => c.statut === "pv_a_signer").length;
    const termines = chantiers.filter((c) => c.statut === "termine").length;
    return {
      enAttente,
      enCours,
      aSigner,
      termines
    };
  }, [chantiers]);
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 6
    }
  }));
  const onDragEnd = (e) => {
    const {
      active,
      over
    } = e;
    if (!over) return;
    const id = String(active.id);
    const newStatut = String(over.id);
    const ch = chantiers.find((c) => c.id === id);
    if (!ch || ch.statut === newStatut) return;
    updateChantierStatut(id, newStatut);
    setData(loadAll());
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none", children: "PV & Suivi devis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[#8B847D] text-sm mt-[7px]", children: "Pilotez vos dossiers, du devis à la signature du PV de réception." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: openNew, onOpenChange: setOpenNew, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "btn-capeb flex items-center gap-[9px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { style: {
            width: 18,
            height: 18,
            strokeWidth: 2.2
          } }),
          "Nouveau dossier"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(NouveauDossierDialog, { onClose: () => setOpenNew(false), clients })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-4 grid-cols-2 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Devis en attente", value: stats.enAttente, trend: "À chiffrer ou à relancer", iconBg: "#FCE7E9", iconColor: "#E2001A", icon: FileText, delay: 0.04 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Travaux en cours", value: stats.enCours, trend: "Chantiers actifs", iconBg: "#E8EFFB", iconColor: "#2563C9", icon: Hammer, delay: 0.1 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "PV à signer", value: stats.aSigner, trend: "Prêt à envoyer au client", iconBg: "#FBF1DE", iconColor: "#D98A00", icon: Clock, delay: 0.16 }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Chantiers terminés", value: stats.termines, trend: "Dossiers bouclés", iconBg: "#E7F4EC", iconColor: "#1E8E55", icon: CircleCheck, delay: 0.22 })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between flex-wrap gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-semibold uppercase tracking-[.05em] text-[#4A453F]", children: "Pipeline des dossiers" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, onDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-[13px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6", children: STATUTS.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(Column, { statut: s, chantiers, clients, onOpen: (ch, cl) => setOpenDossier({
      chantier: ch,
      client: cl
    }) }, s.value)) }) }),
    openDossier && /* @__PURE__ */ jsxRuntimeExports.jsx(DossierDetailDialog, { open: true, onOpenChange: (o) => !o && setOpenDossier(null), chantier: openDossier.chantier, client: openDossier.client, onGenererPv: () => {
      setOpenPv(openDossier);
      setOpenDossier(null);
    } }),
    openPv && /* @__PURE__ */ jsxRuntimeExports.jsx(PvDocumentDialog, { open: true, onOpenChange: (o) => !o && setOpenPv(null), chantier: openPv.chantier, client: openPv.client })
  ] });
}
function StatCard({
  label,
  value,
  trend,
  iconBg,
  iconColor,
  icon: Icon,
  delay
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-[16px] border border-[#ECE7E1] p-[18px] relative transition-all duration-200 hover:-translate-y-0.5", style: {
    boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)",
    animation: `fadeInUp .5s ease ${delay}s both`
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center rounded-[12px] mb-3", style: {
      width: 42,
      height: 42,
      background: iconBg,
      flexShrink: 0
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { style: {
      width: 21,
      height: 21,
      stroke: iconColor,
      fill: "none",
      strokeWidth: 2
    } }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[36px] font-semibold leading-none text-[#1A1714]", children: value }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12.5px] text-[#4A453F] font-medium mt-1", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11.5px] text-[#8B847D] mt-2", children: trend })
  ] });
}
function Column({
  statut,
  chantiers,
  clients,
  onOpen
}) {
  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: statut.value
  });
  const items = chantiers.filter((c) => c.statut === statut.value);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, className: "rounded-[15px] p-[12px] min-h-[120px] transition-all duration-150", style: {
    background: isOver ? "#FCE7E9" : "linear-gradient(180deg, rgba(255,255,255,.6) 0%, rgba(255,255,255,.3) 100%)",
    border: isOver ? "2px dashed #E2001A" : "1px solid #ECE7E1"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-1 pb-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-[9px] h-[9px] rounded-full flex-shrink-0", style: {
        background: statut.dotColor
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[12.5px] font-semibold uppercase text-[#4A453F] flex-1 truncate", children: statut.label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold px-2 py-[1px] rounded-full", style: {
        background: "white",
        border: "1px solid #ECE7E1",
        color: "#4A453F"
      }, children: items.length })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-[10px]", children: [
      items.map((ch) => {
        const cl = clients.find((c) => c.id === ch.client_id);
        if (!cl) return null;
        return /* @__PURE__ */ jsxRuntimeExports.jsx(DraggableCard, { chantier: ch, client: cl, statut, onOpen: () => onOpen(ch, cl) }, ch.id);
      }),
      items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 24 24", style: {
          width: 24,
          height: 24,
          stroke: "#CFC8C0",
          strokeWidth: 1.6,
          fill: "none",
          marginBottom: 6
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M5 12h14M12 5v14" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11.5px] text-[#B7B0A8] leading-tight", children: "Glissez un dossier ici" })
      ] })
    ] })
  ] });
}
function DraggableCard({
  chantier,
  client,
  statut,
  onOpen
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: chantier.id
  });
  const transformStyle = transform ? {
    transform: `translate3d(${transform.x}px,${transform.y}px,0)`,
    zIndex: 50
  } : {};
  const inits = initiales(client.nom);
  const bg = avatarColor(client.nom);
  const city = cityFromAdresse(client.adresse);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, className: cn("bg-white rounded-[13px] p-[13px] cursor-grab active:cursor-grabbing select-none transition-all duration-150", isDragging && "opacity-40"), style: {
    ...transformStyle,
    border: "1px solid #ECE7E1",
    boxShadow: isDragging ? "0 8px 24px rgba(26,23,20,.18)" : "0 1px 2px rgba(26,23,20,.05)"
  }, onMouseEnter: (e) => {
    if (!isDragging) {
      e.currentTarget.style.boxShadow = "0 2px 6px rgba(26,23,20,.07), 0 16px 40px rgba(26,23,20,.09)";
      e.currentTarget.style.transform = `${transformStyle.transform ?? ""} translateY(-3px)`;
      e.currentTarget.style.borderColor = "#E2DCD4";
    }
  }, onMouseLeave: (e) => {
    e.currentTarget.style.boxShadow = "0 1px 2px rgba(26,23,20,.05)";
    e.currentTarget.style.transform = transformStyle.transform ?? "";
    e.currentTarget.style.borderColor = "#ECE7E1";
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ...listeners, ...attributes, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-[9px] mb-[9px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center rounded-[9px] font-display text-[13px] text-white flex-shrink-0", style: {
          width: 30,
          height: 30,
          background: bg
        }, children: inits }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm leading-tight text-[#1A1714] truncate", children: client.nom }),
          city && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11.5px] text-[#8B847D] truncate", children: city })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[12.5px] text-[#4A453F] leading-[1.4] mb-[11px] line-clamp-2", children: chantier.nature_travaux }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10.5px] font-semibold px-[9px] py-[4px] rounded-[7px] whitespace-nowrap", style: {
          background: statut.chipBg,
          color: statut.chipColor
        }, children: statut.label }),
        chantier.montant_estime != null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-[13px] text-[#1A1714]", children: [
          chantier.montant_estime.toLocaleString("fr-FR"),
          " €"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: onOpen, className: "mt-2 w-full text-[11px] text-[#E2001A] hover:text-[#B00013] font-medium flex items-center justify-center gap-1 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FilePenLine, { className: "h-3 w-3" }),
      " Ouvrir le dossier"
    ] })
  ] });
}
function NouveauDossierDialog({
  onClose,
  clients
}) {
  const [clientChoice, setClientChoice] = reactExports.useState("__new__");
  const [nom, setNom] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [telephone, setTelephone] = reactExports.useState("");
  const [adresse, setAdresse] = reactExports.useState("");
  const [nature, setNature] = reactExports.useState("");
  const [montant, setMontant] = reactExports.useState("");
  const [duree, setDuree] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  const isNew = clientChoice === "__new__";
  const selectedClient = !isNew ? clients.find((c) => c.id === clientChoice) : null;
  const handleClientChange = (val) => {
    setClientChoice(val);
    if (val === "__new__") {
      setNom("");
      setEmail("");
      setTelephone("");
      setAdresse("");
    } else {
      const c = clients.find((x) => x.id === val);
      if (c) {
        setNom(c.nom);
        setEmail(c.email ?? "");
        setTelephone(c.telephone ?? "");
        setAdresse(c.adresse ?? "");
      }
    }
  };
  const submit = (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let clientId;
      if (isNew) {
        const c = addClient({
          nom,
          email: email || null,
          telephone: telephone || null,
          adresse: adresse || null
        });
        clientId = c.id;
      } else {
        if (!selectedClient) throw new Error("Client introuvable");
        clientId = selectedClient.id;
      }
      addChantier({
        client_id: clientId,
        nature_travaux: nature,
        montant_estime: montant ? Number(montant) : null,
        duree_estimee: duree || null,
        statut: "devis_a_faire"
      });
      notifyUpdate();
      toast.success("Nouveau dossier créé");
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "max-w-lg max-h-[92vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display text-2xl", children: "Nouveau dossier" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Client *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: clientChoice, onValueChange: handleClientChange, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, { placeholder: "Choisir un client" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "__new__", children: "+ Nouveau client" }),
            clients.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: c.id, children: c.nom }, c.id))
          ] })
        ] })
      ] }),
      isNew ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase tracking-wider text-primary", children: "Nouveau client (saisi une seule fois)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nom *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { required: true, value: nom, onChange: (e) => setNom(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "E-mail" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: email, onChange: (e) => setEmail(e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Téléphone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: telephone, onChange: (e) => setTelephone(e.target.value) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Adresse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: adresse, onChange: (e) => setAdresse(e.target.value), rows: 2 })
        ] })
      ] }) : selectedClient ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border bg-muted/40 p-3 text-sm space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: selectedClient.nom }),
        selectedClient.email && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: selectedClient.email }),
        selectedClient.telephone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: selectedClient.telephone }),
        selectedClient.adresse && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground whitespace-pre-line", children: selectedClient.adresse }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground italic pt-1", children: "Coordonnées pré-remplies automatiquement." })
      ] }) : null,
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nature des travaux *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { required: true, value: nature, onChange: (e) => setNature(e.target.value), rows: 2 })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Montant estimé (€)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", step: "0.01", value: montant, onChange: (e) => setMontant(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Durée estimée" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: duree, onChange: (e) => setDuree(e.target.value), placeholder: "ex : 3 semaines" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Annuler" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: saving || !isNew && !selectedClient, children: saving ? "Enregistrement…" : "Créer le dossier" })
      ] })
    ] })
  ] });
}
export {
  PvPage as component
};
