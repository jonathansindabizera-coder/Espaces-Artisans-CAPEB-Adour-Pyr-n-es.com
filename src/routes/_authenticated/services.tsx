import { createFileRoute } from "@tanstack/react-router";
import {
  Scale, BadgeCheck, Wrench, Handshake, Briefcase, Gift, GraduationCap, Mail,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/services")({
  ssr: false,
  head: () => ({ meta: [{ title: "Nos services CAPEB" }] }),
  component: ServicesPage,
});

type Pole = {
  pole: string;
  referent: string;
  email: string;
  intro: string;
  points: string[];
  icon: LucideIcon;
};

const POLES: Pole[] = [
  {
    pole: "Juridique & Social",
    referent: "Nicolas SOUARD",
    email: "nicolas.souard@capeb-adour-pyrenees.fr",
    intro: "Des conseils personnalisés pour la gestion de votre entreprise.",
    points: [
      "Modèles de contrats de travail types",
      "Obligations employeur",
      "Revalorisation des salaires et indemnités de petits déplacements",
      "Conseils juridiques / Permanence Avocat",
    ],
    icon: Scale,
  },
  {
    pole: "Qualification",
    referent: "Virginie BORGES",
    email: "virginie.borges@capeb-adour-pyrenees.fr",
    intro: "Une assistance pour l'obtention de vos qualifications et certifications.",
    points: [
      "Accompagnement au montage des dossiers",
      "Qualification RGE",
      "Appellation PGI/PGM",
      "Label Handibat",
      "CIP Patrimoine",
    ],
    icon: BadgeCheck,
  },
  {
    pole: "Technique & Éco.",
    referent: "Guillaume PIGUÉ",
    email: "guillaume.pigue@capeb-adour-pyrenees.fr",
    intro: "Un accompagnement pour répondre à vos questions techniques & économiques.",
    points: [
      "Accès aux DTU et aux normes",
      "Accès à une bibliothèque de prix en ligne",
      "Mise en relation logiciel de facturation",
      "Explication sur les systèmes d'aides fiscales client en vigueur",
    ],
    icon: Wrench,
  },
  {
    pole: "Cession-Reprise",
    referent: "Serge CAZEAUX",
    email: "serge.cazeaux@capeb-adour-pyrenees.fr",
    intro: "N'avancez plus seul·e dans vos démarches.",
    points: [
      "Identification des entreprises",
      "Orientation vers les partenaires",
      "Communication auprès des adhérents",
    ],
    icon: Handshake,
  },
  {
    pole: "Emploi",
    referent: "Delphine BELLOC",
    email: "delphine.belloc@capeb-adour-pyrenees.fr",
    intro: "Valorisation des métiers de l'artisanat.",
    points: [
      "Accompagnement au recrutement",
      "Lien avec le tissu économique",
      "Aide à la création d'entreprise : CréArtBât",
      "Promotion des métiers du bâtiment",
    ],
    icon: Briefcase,
  },
  {
    pole: "Avantages CAPEB",
    referent: "Nicolas SOUARD",
    email: "nicolas.souard@capeb-adour-pyrenees.fr",
    intro: "Boostez votre pouvoir d'achat et réalisez des économies.",
    points: [
      "Accès gratuit à une centrale d'achats BTP",
      "Avantages frais généraux",
      "Achats métiers",
      "Comité d'entreprise privé",
    ],
    icon: Gift,
  },
  {
    pole: "Formation",
    referent: "Thierry JODAR",
    email: "thierry.jodar@adour-pyrenees-conseil.fr",
    intro: "Des informations et une assistance pour gagner en efficacité et en compétences.",
    points: [
      "Identification des besoins",
      "Planification des sessions de formation",
      "Gestion administrative des dossiers et prise en charge (FAFCEA / Constructys)",
    ],
    icon: GraduationCap,
  },
];

function ServicesPage() {
  return (
    <div className="space-y-5">

      {/* En-tête */}
      <div>
        <h1 className="font-display text-[30px] font-semibold text-[#1A1714] uppercase leading-none">
          Nos services CAPEB
        </h1>
        <p className="text-[#8B847D] text-sm mt-[7px]">
          7 pôles pour un accompagnement complet
        </p>
      </div>

      {/* Grille des pôles */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {POLES.map(p => (
          <CartePole key={p.pole} data={p} />
        ))}
      </div>
    </div>
  );
}

function CartePole({ data }: { data: Pole }) {
  const prenom = data.referent.split(" ")[0];

  return (
    <div
      className="bg-white rounded-[14px] border border-[#ECE7E1] p-[18px] flex flex-col gap-3"
      style={{ boxShadow: "0 1px 3px rgba(26,23,20,.06), 0 6px 16px rgba(26,23,20,.05)" }}
    >
      {/* Icône + nom du pôle */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center rounded-[10px] flex-shrink-0"
          style={{ width: 36, height: 36, background: "rgba(226,0,26,.08)" }}
        >
          <data.icon className="h-[18px] w-[18px]" style={{ color: "#E2001A" }} />
        </div>
        <h3 className="font-display text-[17px] font-semibold leading-tight text-[#1A1714]">
          {data.pole}
        </h3>
      </div>

      {/* Intro */}
      <p className="text-sm text-[#4A453F]">{data.intro}</p>

      {/* Prestations */}
      <ul className="space-y-1.5">
        {data.points.map(point => (
          <li key={point} className="flex items-start gap-2 text-[13px] text-[#4A453F] leading-snug">
            <span className="mt-[7px] h-[5px] w-[5px] rounded-full bg-[#E2001A] flex-shrink-0" />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {/* Mention spécifique Formation */}
      {data.pole === "Formation" && (
        <p className="text-[11px] italic text-[#8B847D]">
          Adour-Pyrénées Conseil, une marque de la CAPEB Adour-Pyrénées.
        </p>
      )}

      {/* Référent + bouton de contact */}
      <div className="mt-auto pt-3 border-t border-[#F0EBE4] flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[12.5px] font-medium text-[#8B847D]">{data.referent}</span>
        <a
          href={`mailto:${data.email}`}
          className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white rounded-[9px] px-[13px] py-[9px] transition-colors"
          style={{ background: "linear-gradient(180deg,#EA1227,#D2001A)", boxShadow: "0 3px 10px rgba(226,0,26,.3)" }}
        >
          <Mail className="h-3.5 w-3.5" />
          Contacter {prenom}
        </a>
      </div>
    </div>
  );
}
