"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  AMENITIES,
  Currency,
  ListingSource,
  PROVINCES,
  PropertyStatus,
  PropertyType,
  TransactionType,
} from "@regis/domain";
import {
  listingSourceLabels,
  propertyTypeLabels,
  statusLabels,
  transactionLabels,
} from "@/lib/labels";
import { saveProperty, type PropertyFormState } from "@/app/admin/(painel)/imoveis/actions";

export interface PropertyFormValues {
  id?: string;
  title: string;
  description: string;
  transactionType: TransactionType;
  propertyType: PropertyType;
  listingSource: ListingSource;
  status: PropertyStatus;
  priceAmountMajor: string;
  priceCurrency: Currency;
  province: string;
  municipality: string;
  neighborhood: string;
  bedrooms: string;
  bathrooms: string;
  parkingSpaces: string;
  areaM2: string;
  lotAreaM2: string;
  amenities: string[];
  featured: boolean;
  mediaUrls: string;
  videoUrls: string;
}

const EMPTY: PropertyFormValues = {
  title: "",
  description: "",
  transactionType: "SALE",
  propertyType: "HOUSE",
  listingSource: "PROFESSIONAL",
  status: "DRAFT",
  priceAmountMajor: "",
  priceCurrency: "AOA",
  province: "Luanda",
  municipality: "",
  neighborhood: "",
  bedrooms: "",
  bathrooms: "",
  parkingSpaces: "",
  areaM2: "",
  lotAreaM2: "",
  amenities: [],
  featured: false,
  mediaUrls: "",
  videoUrls: "",
};

const inputClass =
  "mt-1 h-11 w-full rounded-control border border-line-strong bg-canvas px-3 text-sm text-ink outline-none focus:border-accent";
const labelClass = "block text-sm font-medium text-ink";

function FieldError({ messages }: { messages?: string[] | undefined }) {
  const first = messages?.[0];
  if (!first) return null;
  return <p className="mt-1 text-xs text-danger">{first}</p>;
}

export function PropertyForm({ values }: { values?: PropertyFormValues }) {
  const initial = values ?? EMPTY;
  const [state, formAction, pending] = useActionState<PropertyFormState, FormData>(
    saveProperty,
    {},
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      {state.error ? (
        <p role="alert" className="rounded-control bg-danger/10 px-4 py-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Informação principal</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Título
            </label>
            <input id="title" name="title" defaultValue={initial.title} className={inputClass} />
            <FieldError messages={errors.title} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              defaultValue={initial.description}
              className="mt-1 w-full rounded-control border border-line-strong bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <FieldError messages={errors.description} />
          </div>

          <div>
            <label htmlFor="transactionType" className={labelClass}>
              Operação
            </label>
            <select
              id="transactionType"
              name="transactionType"
              defaultValue={initial.transactionType}
              className={inputClass}
            >
              {Object.entries(transactionLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="propertyType" className={labelClass}>
              Tipo de imóvel
            </label>
            <select
              id="propertyType"
              name="propertyType"
              defaultValue={initial.propertyType}
              className={inputClass}
            >
              {Object.entries(propertyTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className={labelClass}>
              Estado
            </label>
            <select id="status" name="status" defaultValue={initial.status} className={inputClass}>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="listingSource" className={labelClass}>
              Anunciante
            </label>
            <select
              id="listingSource"
              name="listingSource"
              defaultValue={initial.listingSource}
              className={inputClass}
            >
              {Object.entries(listingSourceLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={initial.featured}
                className="size-4 rounded border-line-strong"
              />
              Destacar na página inicial
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Preço</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label htmlFor="priceAmountMajor" className={labelClass}>
              Valor
            </label>
            <input
              id="priceAmountMajor"
              name="priceAmountMajor"
              inputMode="decimal"
              defaultValue={initial.priceAmountMajor}
              className={inputClass}
            />
            <FieldError messages={errors["price"] ?? errors["price.amountMajor"]} />
          </div>
          <div>
            <label htmlFor="priceCurrency" className={labelClass}>
              Moeda
            </label>
            <select
              id="priceCurrency"
              name="priceCurrency"
              defaultValue={initial.priceCurrency}
              className={inputClass}
            >
              {Object.values(Currency).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Localização e áreas</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="province" className={labelClass}>
              Província
            </label>
            <select id="province" name="province" defaultValue={initial.province} className={inputClass}>
              {PROVINCES.map((province) => (
                <option key={province.slug} value={province.name}>
                  {province.name}
                </option>
              ))}
            </select>
            <FieldError messages={errors.province} />
          </div>
          <div>
            <label htmlFor="municipality" className={labelClass}>
              Município
            </label>
            <input
              id="municipality"
              name="municipality"
              defaultValue={initial.municipality}
              className={inputClass}
            />
            <FieldError messages={errors.municipality} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="neighborhood" className={labelClass}>
              Bairro / Zona (opcional)
            </label>
            <input
              id="neighborhood"
              name="neighborhood"
              defaultValue={initial.neighborhood}
              className={inputClass}
            />
          </div>

          {(
            [
              ["bedrooms", "Quartos", initial.bedrooms],
              ["bathrooms", "Casas de banho", initial.bathrooms],
              ["parkingSpaces", "Estacionamentos", initial.parkingSpaces],
              ["areaM2", "Área (m²)", initial.areaM2],
              ["lotAreaM2", "Área do lote (m²)", initial.lotAreaM2],
            ] as const
          ).map(([name, label, value]) => (
            <div key={name}>
              <label htmlFor={name} className={labelClass}>
                {label}
              </label>
              <input
                id={name}
                name={name}
                inputMode="numeric"
                defaultValue={value}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Comodidades</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {AMENITIES.map((amenity) => (
            <label key={amenity.key} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="checkbox"
                name="amenities"
                value={amenity.key}
                defaultChecked={initial.amenities.includes(amenity.key)}
                className="size-4 rounded border-line-strong"
              />
              {amenity.label}
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Imagens</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Um URL por linha. A primeira imagem é usada como imagem principal.
        </p>
        <textarea
          name="mediaUrls"
          rows={4}
          defaultValue={initial.mediaUrls}
          placeholder={"https://…/foto-1.jpg\nhttps://…/foto-2.jpg"}
          className="mt-3 w-full rounded-control border border-line-strong bg-canvas px-3 py-2 font-mono text-xs text-ink outline-none focus:border-accent"
        />

        <div className="mt-5 border-t border-line pt-4">
          <label htmlFor="files" className={labelClass}>
            Enviar ficheiros
          </label>
          <p className="mt-1 text-xs text-ink-muted">
            As imagens enviadas ficam antes das indicadas acima. Máx. 5 MB cada; aceitamos JPG,
            PNG, WEBP e AVIF.
          </p>
          <input
            id="files"
            name="files"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="mt-3 block w-full cursor-pointer rounded-control border border-line-strong bg-canvas px-3 py-2 text-sm text-ink file:mr-3 file:cursor-pointer file:rounded-control file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
          />
        </div>
      </section>

      <section className="rounded-card border border-line bg-canvas p-5">
        <h2 className="font-display text-base font-bold text-navy">Vídeos</h2>
        <p className="mt-1 text-xs text-ink-muted">
          Um URL por linha. Aceita YouTube, YouTube Shorts, TikTok ou vídeo direto MP4/WebM. Os
          vídeos aparecem na área de vídeos e na galeria do imóvel.
        </p>
        <textarea
          name="videoUrls"
          rows={3}
          defaultValue={initial.videoUrls}
          placeholder={"https://youtube.com/watch?v=…\nhttps://www.tiktok.com/@…/video/…\nhttps://…/tour.mp4"}
          className="mt-3 w-full rounded-control border border-line-strong bg-canvas px-3 py-2 font-mono text-xs text-ink outline-none focus:border-accent"
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center rounded-control bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "A guardar…" : initial.id ? "Guardar alterações" : "Criar imóvel"}
        </button>
        <Link
          href="/admin/imoveis"
          className="inline-flex h-11 items-center justify-center rounded-control border border-line-strong px-6 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
