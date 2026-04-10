// lib/bodacc.ts
import type { ProspectInput, SearchCriteria } from './types'

// Dataset simulé de 20 profils avec événements patrimoniaux récents
const MOCK_PROFILES: Array<ProspectInput & { event_type: string; event_date: string }> = [
  {
    first_name: 'Pierre', last_name: 'Aubert', job_title: 'PDG',
    company_name: 'Aubert & Fils Construction', sector: 'BTP',
    revenue_m: 12.5, employees: 67, location: 'Bordeaux',
    event_type: 'heritage', event_date: '2026-02-15',
  },
  {
    first_name: 'Marie', last_name: 'Lefebvre', job_title: 'Gérante',
    company_name: 'Lefebvre Pharmacie', sector: 'Pharmacie',
    revenue_m: 4.2, employees: 18, location: 'Lyon',
    event_type: 'heritage', event_date: '2026-03-01',
  },
  {
    first_name: 'Antoine', last_name: 'Rousseau', job_title: 'Directeur Général',
    company_name: 'Rousseau Industries', sector: 'Industrie',
    revenue_m: 28.0, employees: 142, location: 'Nantes',
    event_type: 'cession', event_date: '2026-01-20',
  },
  {
    first_name: 'Claire', last_name: 'Bernard', job_title: 'Présidente',
    company_name: 'Bernard Immobilier', sector: 'Immobilier',
    revenue_m: 7.8, employees: 31, location: 'Marseille',
    event_type: 'cession', event_date: '2026-03-10',
  },
  {
    first_name: 'Luc', last_name: 'Moreau', job_title: 'PDG',
    company_name: 'Moreau Tech Solutions', sector: 'IT',
    revenue_m: 5.1, employees: 38, location: 'Paris',
    event_type: 'changement_poste', event_date: '2026-02-28',
  },
  {
    first_name: 'Isabelle', last_name: 'Dupuis', job_title: 'Directrice Générale',
    company_name: 'Dupuis Logistique', sector: 'Logistique',
    revenue_m: 9.3, employees: 55, location: 'Lille',
    event_type: 'changement_poste', event_date: '2026-03-05',
  },
  {
    first_name: 'François', last_name: 'Martin', job_title: 'Gérant',
    company_name: 'Martin Restauration', sector: 'Hôtellerie',
    revenue_m: 3.6, employees: 28, location: 'Toulouse',
    event_type: 'heritage', event_date: '2026-01-10',
  },
  {
    first_name: 'Sophie', last_name: 'Garnier', job_title: 'PDG',
    company_name: 'Garnier Médical', sector: 'Médical',
    revenue_m: 6.4, employees: 24, location: 'Strasbourg',
    event_type: 'cession', event_date: '2026-02-05',
  },
  {
    first_name: 'Paul', last_name: 'Fontaine', job_title: 'Président',
    company_name: 'Fontaine Énergie', sector: 'Énergie',
    revenue_m: 15.2, employees: 89, location: 'Paris',
    event_type: 'changement_poste', event_date: '2026-03-15',
  },
  {
    first_name: 'Anne', last_name: 'Chevalier', job_title: 'Co-fondatrice',
    company_name: 'Chevalier SaaS', sector: 'IT',
    revenue_m: 2.8, employees: 19, location: 'Paris',
    event_type: 'cession', event_date: '2026-01-30',
  },
  {
    first_name: 'Marc', last_name: 'Petit', job_title: 'PDG',
    company_name: 'Petit & Associés BTP', sector: 'BTP',
    revenue_m: 18.7, employees: 98, location: 'Nice',
    event_type: 'heritage', event_date: '2026-02-20',
  },
  {
    first_name: 'Nathalie', last_name: 'Simon', job_title: 'Directrice',
    company_name: 'Simon Conseil', sector: 'Conseil',
    revenue_m: 2.1, employees: 12, location: 'Lyon',
    event_type: 'changement_poste', event_date: '2026-03-08',
  },
  {
    first_name: 'David', last_name: 'Laurent', job_title: 'Gérant',
    company_name: 'Laurent Distribution', sector: 'Commerce',
    revenue_m: 11.4, employees: 63, location: 'Bordeaux',
    event_type: 'cession', event_date: '2026-02-12',
  },
  {
    first_name: 'Julie', last_name: 'Thomas', job_title: 'PDG',
    company_name: 'Thomas Chirurgie', sector: 'Médical',
    revenue_m: 5.9, employees: 21, location: 'Paris',
    event_type: 'heritage', event_date: '2026-01-25',
  },
  {
    first_name: 'Nicolas', last_name: 'Robert', job_title: 'Fondateur',
    company_name: 'Robert ESN', sector: 'IT',
    revenue_m: 4.5, employees: 33, location: 'Rennes',
    event_type: 'changement_poste', event_date: '2026-03-12',
  },
  {
    first_name: 'Émilie', last_name: 'Dubois', job_title: 'Présidente',
    company_name: 'Dubois Pharmacie', sector: 'Pharmacie',
    revenue_m: 3.1, employees: 16, location: 'Montpellier',
    event_type: 'heritage', event_date: '2026-02-08',
  },
  {
    first_name: 'Christophe', last_name: 'Henry', job_title: 'DG',
    company_name: 'Henry Industrie', sector: 'Industrie',
    revenue_m: 22.3, employees: 115, location: 'Mulhouse',
    event_type: 'cession', event_date: '2026-01-15',
  },
  {
    first_name: 'Valérie', last_name: 'Blanc', job_title: 'Gérante',
    company_name: 'Blanc Immobilier', sector: 'Immobilier',
    revenue_m: 6.8, employees: 27, location: 'Aix-en-Provence',
    event_type: 'heritage', event_date: '2026-03-18',
  },
  {
    first_name: 'Sébastien', last_name: 'Richard', job_title: 'PDG',
    company_name: 'Richard Logistique', sector: 'Logistique',
    revenue_m: 13.6, employees: 74, location: 'Grenoble',
    event_type: 'changement_poste', event_date: '2026-02-25',
  },
  {
    first_name: 'Céline', last_name: 'Morel', job_title: 'Directrice Générale',
    company_name: 'Morel Hôtellerie', sector: 'Hôtellerie',
    revenue_m: 8.1, employees: 52, location: 'Paris',
    event_type: 'cession', event_date: '2026-03-20',
  },
]

export function searchBodacc(criteria: SearchCriteria): ProspectInput[] {
  let results = [...MOCK_PROFILES]

  if (criteria.event_types.length > 0) {
    results = results.filter((p) => criteria.event_types.includes(p.event_type as never))
  }

  if (criteria.sectors.length > 0) {
    results = results.filter((p) =>
      criteria.sectors.some((s) =>
        p.sector?.toLowerCase().includes(s.toLowerCase()),
      ),
    )
  }

  if (criteria.regions.length > 0) {
    results = results.filter((p) =>
      criteria.regions.some((r) =>
        p.location?.toLowerCase().includes(r.toLowerCase()),
      ),
    )
  }

  return results.slice(0, criteria.limit).map(({ event_type: _e, event_date: _d, ...p }) => p)
}
