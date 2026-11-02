"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type { SearchFilters } from "./types";

export const keys = {
  search: (f: SearchFilters) => ["listings", "search", f] as const,
  featured: ["listings", "featured"] as const,
  listing: (id: string) => ["listings", id] as const,
  myListings: ["listings", "mine"] as const,
  saved: ["saved"] as const,
  savedListings: ["saved", "listings"] as const,
  slots: (id: string) => ["slots", id] as const,
  inspections: ["inspections"] as const,
  applications: ["applications"] as const,
  landlordApplications: ["applications", "landlord"] as const,
  application: (id: string) => ["applications", id] as const,
  payment: (appId: string) => ["payments", appId] as const,
  payments: ["payments"] as const,
  threads: ["threads"] as const,
  messages: (id: string) => ["threads", id] as const,
  onboarding: ["onboarding"] as const,
  mandates: ["mandates"] as const,
};

/* Listings */
export const useSearch = (f: SearchFilters) =>
  useQuery({ queryKey: keys.search(f), queryFn: () => api.searchListings(f), placeholderData: (prev) => prev });
export const useFeatured = () => useQuery({ queryKey: keys.featured, queryFn: api.getFeatured });
export const useListing = (id: string) =>
  useQuery({ queryKey: keys.listing(id), queryFn: () => api.getListing(id), retry: false });
export const useMyListings = () => useQuery({ queryKey: keys.myListings, queryFn: api.getMyListings });

export function useCreateListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createListing,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

export function useConfirmAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.confirmAvailability,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["listings"] }),
  });
}

/* Saved */
export const useSavedIds = () => useQuery({ queryKey: keys.saved, queryFn: api.getSavedIds });
export const useSavedListings = () => useQuery({ queryKey: keys.savedListings, queryFn: api.getSavedListings });

export function useToggleSaved() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.toggleSaved,
    onMutate: async (listingId: string) => {
      await qc.cancelQueries({ queryKey: keys.saved });
      const prev = qc.getQueryData<string[]>(keys.saved) ?? [];
      qc.setQueryData<string[]>(
        keys.saved,
        prev.includes(listingId) ? prev.filter((x) => x !== listingId) : [...prev, listingId],
      );
      return { prev };
    },
    onError: (_e, _id, ctx) => ctx && qc.setQueryData(keys.saved, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: keys.saved }),
  });
}

/* Inspections */
export const useSlots = (listingId: string) =>
  useQuery({ queryKey: keys.slots(listingId), queryFn: () => api.getSlots(listingId) });
export const useInspections = () => useQuery({ queryKey: keys.inspections, queryFn: api.getMyInspections });

export function useBookInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.bookInspection,
    onSuccess: (i) => {
      qc.invalidateQueries({ queryKey: keys.inspections });
      qc.invalidateQueries({ queryKey: keys.slots(i.listingId) });
    },
  });
}

export function useCancelInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.cancelInspection,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.inspections }),
  });
}

/* Applications */
export const useApplications = () =>
  useQuery({ queryKey: keys.applications, queryFn: api.getMyApplications, refetchInterval: 3000 });
export const useLandlordApplications = () =>
  useQuery({ queryKey: keys.landlordApplications, queryFn: api.getLandlordApplications });
export const useApplication = (id: string) =>
  useQuery({ queryKey: keys.application(id), queryFn: () => api.getApplication(id), retry: false, refetchInterval: 3000 });

export function useSubmitApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.submitApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

export function useDecideApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api.decideApplication(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["applications"] }),
  });
}

/* Payments */
export const usePayment = (appId: string) =>
  useQuery({ queryKey: keys.payment(appId), queryFn: () => api.getPaymentForApplication(appId) });
export const usePayments = () => useQuery({ queryKey: keys.payments, queryFn: api.getMyPayments });

export function usePay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.payForApplication,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["payments"] }),
  });
}

export function useConfirmMoveIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.confirmMoveIn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["listings"] });
    },
  });
}

/* Messages */
export const useThreads = () => useQuery({ queryKey: keys.threads, queryFn: api.getThreads });
export const useMessages = (threadId: string) =>
  useQuery({ queryKey: keys.messages(threadId), queryFn: () => api.getMessages(threadId), enabled: !!threadId });

export function useSendMessage(threadId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => api.sendMessage(threadId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.threads }),
  });
}

/* Onboarding */
export const useOnboarding = () =>
  useQuery({ queryKey: keys.onboarding, queryFn: api.getOnboarding, refetchInterval: 3000 });

export function useSetRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.setOnboardingRole,
    onSuccess: (s) => qc.setQueryData(keys.onboarding, s),
  });
}

export function useSubmitStep() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, data }: { stepId: Parameters<typeof api.submitOnboardingStep>[0]; data: Record<string, string> }) =>
      api.submitOnboardingStep(stepId, data),
    onSuccess: (s) => qc.setQueryData(keys.onboarding, s),
  });
}

/* Mandates */
export const useMandates = () => useQuery({ queryKey: keys.mandates, queryFn: api.getMandates });

export function useRequestMandate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.requestMandate,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.mandates }),
  });
}

/* Reports */
export function useReportListing() {
  return useMutation({
    mutationFn: ({ listingId, reason, details }: { listingId: string; reason: string; details: string }) =>
      api.reportListing(listingId, reason, details),
  });
}
