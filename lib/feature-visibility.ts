/**
 * Feature Visibility System
 * 
 * Manages which features/navigation items are visible to each role.
 * Settings are stored in Firebase and synced in real-time.
 */

import { useState, useEffect, useCallback } from "react";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserRole } from "@/lib/role-permissions";

// Feature categories for organization
export type FeatureCategory = "navigation" | "work" | "admin" | "ai" | "initiatives";

// Feature definition
export interface FeatureDefinition {
  id: string;
  name: string;
  description: string;
  category: FeatureCategory;
  requiresSubscription?: string[];
}

// All available features in the platform
export const FEATURES: FeatureDefinition[] = [
  // Navigation features
  { id: "command-center", name: "Command Center", description: "Main dashboard overview", category: "navigation" },
  { id: "opportunities", name: "Opportunities", description: "Sales opportunities tracking", category: "navigation" },
  { id: "projects", name: "Projects", description: "Project management", category: "navigation" },
  { id: "affiliates", name: "Affiliates", description: "Affiliate partner management", category: "navigation" },
  { id: "customers", name: "Customers", description: "Customer relationship management", category: "navigation" },
  
  // Work features
  { id: "gov-solicitations", name: "Gov Solicitations", description: "Government solicitation search", category: "work" },
  { id: "fpds-search", name: "FPDS Search", description: "Federal procurement data search", category: "work" },
  { id: "apollo-search", name: "Apollo Search", description: "Apollo.io lead search", category: "work" },
  { id: "supplier-search", name: "Supplier Search", description: "Supplier database search", category: "work" },
  { id: "documents", name: "Documents", description: "Document management", category: "work" },
  { id: "calendar", name: "Calendar", description: "Calendar and scheduling", category: "work" },
  { id: "availability", name: "Availability", description: "Availability management", category: "work" },
  { id: "meetings", name: "Meetings", description: "Meeting management", category: "work" },
  { id: "rocks", name: "Rocks", description: "EOS Rocks tracking", category: "work" },
  { id: "networking", name: "Networking", description: "Networking and connections", category: "work" },
  { id: "deals", name: "Deals", description: "Deal tracking and commissions", category: "work" },
  { id: "linkedin-content", name: "LinkedIn Content", description: "LinkedIn content creation", category: "work" },
  { id: "eos2", name: "EOS2 Dashboard", description: "EOS Level 10 dashboard", category: "work" },
  { id: "docuseal", name: "DocuSeal", description: "Document signing", category: "work" },
  
  // AI features
  { id: "ai-workforce", name: "AI Workforce", description: "AI employee management", category: "ai" },
  
  // Admin features
  { id: "team-members", name: "Team Members", description: "Team member management", category: "admin" },
  { id: "settings", name: "Settings", description: "Platform settings", category: "admin" },
  { id: "bug-tracker", name: "Bug Tracker", description: "Bug and issue tracking", category: "admin" },
  { id: "feature-visibility", name: "Feature Visibility", description: "Manage feature visibility per role", category: "admin" },
  
  // Initiative features
  { id: "initiatives", name: "Initiatives", description: "Strategic initiatives", category: "initiatives" },
];

// Feature visibility settings per role
export interface FeatureVisibilityByRole {
  [roleId: string]: {
    [featureName: string]: boolean;
  };
}

// Firestore document path
const FEATURE_VISIBILITY_DOC = "featureVisibilityByRole";
const PLATFORM_SETTINGS_COLLECTION = "platformSettings";

/**
 * Get default feature visibility settings for a role
 */
export function getDefaultRoleSettings(role: string): Record<string, boolean> {
  const allFeatures = FEATURES.reduce((acc, f) => ({ ...acc, [f.name]: true }), {} as Record<string, boolean>);
  
  switch (role) {
    case "superadmin":
      return allFeatures; // All features visible
      
    case "admin":
      return {
        ...allFeatures,
        "Feature Visibility": false, // Only SuperAdmin can manage feature visibility
      };
      
    case "team_member":
      return {
        ...allFeatures,
        "Team Members": false,
        "Settings": false,
        "Bug Tracker": false,
        "Feature Visibility": false,
        "Apollo Search": false,
        "Supplier Search": false,
      };
      
    case "affiliate":
    case "consultant":
      return {
        "Command Center": true,
        "Opportunities": true,
        "Projects": true,
        "Customers": false,
        "Affiliates": false,
        "Documents": true,
        "Calendar": true,
        "Availability": true,
        "Meetings": true,
        "Networking": true,
        "Deals": true,
        "LinkedIn Content": true,
        "Gov Solicitations": false,
        "FPDS Search": false,
        "Apollo Search": false,
        "Supplier Search": false,
        "Rocks": false,
        "EOS2 Dashboard": false,
        "DocuSeal": false,
        "AI Workforce": false,
        "Team Members": false,
        "Settings": false,
        "Bug Tracker": false,
        "Feature Visibility": false,
        "Initiatives": false,
      };
      
    case "customer":
      return {
        "Command Center": true,
        "Projects": true,
        "Documents": true,
        "Calendar": true,
        "Meetings": true,
        "Opportunities": false,
        "Affiliates": false,
        "Customers": false,
        "Availability": false,
        "Networking": false,
        "Deals": false,
        "LinkedIn Content": false,
        "Gov Solicitations": false,
        "FPDS Search": false,
        "Apollo Search": false,
        "Supplier Search": false,
        "Rocks": false,
        "EOS2 Dashboard": false,
        "DocuSeal": false,
        "AI Workforce": false,
        "Team Members": false,
        "Settings": false,
        "Bug Tracker": false,
        "Feature Visibility": false,
        "Initiatives": false,
      };
      
    case "viewer":
      return {
        "Command Center": true,
        "Projects": true,
        "Documents": true,
        "Opportunities": false,
        "Affiliates": false,
        "Customers": false,
        "Calendar": false,
        "Availability": false,
        "Meetings": false,
        "Networking": false,
        "Deals": false,
        "LinkedIn Content": false,
        "Gov Solicitations": false,
        "FPDS Search": false,
        "Apollo Search": false,
        "Supplier Search": false,
        "Rocks": false,
        "EOS2 Dashboard": false,
        "DocuSeal": false,
        "AI Workforce": false,
        "Team Members": false,
        "Settings": false,
        "Bug Tracker": false,
        "Feature Visibility": false,
        "Initiatives": false,
      };
      
    default:
      return allFeatures;
  }
}

/**
 * Hook to get and manage feature visibility for a specific role
 */
export function useFeatureVisibility(role: string) {
  const [settings, setSettings] = useState<Record<string, boolean>>(() => getDefaultRoleSettings(role || "viewer"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !role) {
      setSettings(getDefaultRoleSettings(role || "viewer"));
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    // Capture db reference for closure (we've already checked it's not null above)
    const firestore = db;

    // Try to fetch once first to check permissions
    const fetchSettings = async () => {
      try {
        const snapshot = await getDoc(doc(firestore, PLATFORM_SETTINGS_COLLECTION, FEATURE_VISIBILITY_DOC));
        if (cancelled) return;
        
        if (snapshot.exists()) {
          const data = snapshot.data() as FeatureVisibilityByRole;
          const roleSettings = data?.[role] || getDefaultRoleSettings(role);
          setSettings(roleSettings);
          setError(null);
          
          // Only set up real-time listener if initial fetch succeeded
          unsubscribe = onSnapshot(
            doc(firestore, PLATFORM_SETTINGS_COLLECTION, FEATURE_VISIBILITY_DOC),
            (snap) => {
              if (cancelled) return;
              try {
                const snapData = snap.data() as FeatureVisibilityByRole | undefined;
                const rs = snapData?.[role] || getDefaultRoleSettings(role);
                setSettings(rs);
                setError(null);
              } catch (err) {
                console.error("Error parsing feature visibility:", err);
              }
            },
            (err) => {
              // Silently fall back to defaults on listener error
              console.warn("Feature visibility listener error, using defaults");
            }
          );
        } else {
          // Document doesn't exist, use defaults
          setSettings(getDefaultRoleSettings(role));
        }
      } catch (err: any) {
        if (cancelled) return;
        // Permission denied or other error - silently use defaults
        if (err?.code === "permission-denied") {
          console.warn("Feature visibility: permission denied, using defaults");
        } else {
          console.warn("Feature visibility fetch error, using defaults:", err?.message);
        }
        setSettings(getDefaultRoleSettings(role));
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, [role]);

  /**
   * Check if a feature is visible for the current role
   */
  const isFeatureVisible = useCallback((featureName: string): boolean => {
    // If settings haven't loaded yet, use defaults
    if (Object.keys(settings).length === 0) {
      const defaults = getDefaultRoleSettings(role);
      return defaults[featureName] !== false;
    }
    return settings[featureName] !== false;
  }, [settings, role]);

  return { isFeatureVisible, settings, loading, error };
}

/**
 * Hook to manage all feature visibility settings (for admin use)
 */
export function useFeatureVisibilityAdmin() {
  const [allSettings, setAllSettings] = useState<FeatureVisibilityByRole>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }

    const firestore = db;
    let unsubscribe: (() => void) | null = null;
    let cancelled = false;

    // Try to fetch once first to check permissions
    const fetchSettings = async () => {
      try {
        const snapshot = await getDoc(doc(firestore, PLATFORM_SETTINGS_COLLECTION, FEATURE_VISIBILITY_DOC));
        if (cancelled) return;
        
        const data = snapshot.data() as FeatureVisibilityByRole | undefined;
        setAllSettings(data || {});
        setError(null);
        
        // Only set up real-time listener if initial fetch succeeded
        unsubscribe = onSnapshot(
          doc(firestore, PLATFORM_SETTINGS_COLLECTION, FEATURE_VISIBILITY_DOC),
          (snap) => {
            if (cancelled) return;
            try {
              const snapData = snap.data() as FeatureVisibilityByRole | undefined;
              setAllSettings(snapData || {});
              setError(null);
            } catch (err) {
              console.error("Error parsing feature visibility:", err);
            }
          },
          (err) => {
            console.warn("Feature visibility admin listener error");
          }
        );
      } catch (err: any) {
        if (cancelled) return;
        if (err?.code === "permission-denied") {
          console.warn("Feature visibility admin: permission denied");
          setError("Permission denied - SuperAdmin access required");
        } else {
          console.warn("Feature visibility admin fetch error:", err?.message);
          setError("Failed to load settings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      cancelled = true;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Get settings for a specific role (with defaults if not set)
   */
  const getRoleSettings = useCallback((role: string): Record<string, boolean> => {
    return allSettings[role] || getDefaultRoleSettings(role);
  }, [allSettings]);

  /**
   * Save feature visibility settings for a specific role
   */
  const saveRoleSettings = useCallback(async (role: string, features: Record<string, boolean>) => {
    if (!db) {
      setError("Database not available");
      return false;
    }

    const firestore = db;
    setSaving(true);
    setError(null);

    try {
      await setDoc(
        doc(firestore, PLATFORM_SETTINGS_COLLECTION, FEATURE_VISIBILITY_DOC),
        { [role]: features },
        { merge: true }
      );
      setSaving(false);
      return true;
    } catch (err) {
      console.error("Error saving feature visibility:", err);
      setError("Failed to save settings");
      setSaving(false);
      return false;
    }
  }, []);

  /**
   * Reset a role's settings to defaults
   */
  const resetRoleToDefaults = useCallback(async (role: string) => {
    const defaults = getDefaultRoleSettings(role);
    return saveRoleSettings(role, defaults);
  }, [saveRoleSettings]);

  /**
   * Copy settings from one role to another
   */
  const copyFromRole = useCallback(async (sourceRole: string, targetRole: string) => {
    const sourceSettings = getRoleSettings(sourceRole);
    return saveRoleSettings(targetRole, { ...sourceSettings });
  }, [getRoleSettings, saveRoleSettings]);

  /**
   * Enable all features for a role
   */
  const enableAllFeatures = useCallback(async (role: string) => {
    const allEnabled = FEATURES.reduce((acc, f) => ({ ...acc, [f.name]: true }), {} as Record<string, boolean>);
    return saveRoleSettings(role, allEnabled);
  }, [saveRoleSettings]);

  /**
   * Disable all features for a role (except Command Center)
   */
  const disableAllFeatures = useCallback(async (role: string) => {
    const allDisabled = FEATURES.reduce((acc, f) => ({ 
      ...acc, 
      [f.name]: f.name === "Command Center" // Always keep Command Center visible
    }), {} as Record<string, boolean>);
    return saveRoleSettings(role, allDisabled);
  }, [saveRoleSettings]);

  /**
   * Count enabled features for a role
   */
  const countEnabledFeatures = useCallback((role: string): { enabled: number; total: number } => {
    const roleSettings = getRoleSettings(role);
    const enabled = Object.values(roleSettings).filter(v => v === true).length;
    return { enabled, total: FEATURES.length };
  }, [getRoleSettings]);

  return {
    allSettings,
    loading,
    saving,
    error,
    getRoleSettings,
    saveRoleSettings,
    resetRoleToDefaults,
    copyFromRole,
    enableAllFeatures,
    disableAllFeatures,
    countEnabledFeatures,
  };
}

/**
 * Initialize feature visibility settings in Firestore if they don't exist
 */
export async function initializeFeatureVisibility(): Promise<void> {
  if (!db) return;

  const firestore = db;
  try {
    const docRef = doc(firestore, PLATFORM_SETTINGS_COLLECTION, FEATURE_VISIBILITY_DOC);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      // Initialize with default settings for all roles
      const roles: UserRole[] = ["superadmin", "admin", "team_member", "affiliate", "consultant", "customer", "viewer"];
      const initialSettings: FeatureVisibilityByRole = {};

      for (const role of roles) {
        initialSettings[role] = getDefaultRoleSettings(role);
      }

      await setDoc(docRef, initialSettings);
      console.log("Feature visibility settings initialized");
    }
  } catch (err) {
    console.error("Error initializing feature visibility:", err);
  }
}
