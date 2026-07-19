/**
 * Global application routing ledger.
 * Provides a centralized, immutable blueprint of all application URI path states,
 * eliminating hardcoded navigation strings and enforcing architectural consistency.
 * 
 * @remarks
 * This structural dictionary uses an `as const` type assertion to freeze the layout,
 * ensuring strict literal type checking throughout compile-time validations.
 */
export const ROUTES_MAPPING = {

  /**
   * Unauthenticated public application route pathways.
   * Gates common registration schemas and entry-level session authorization endpoints.
   */
  auth: {
    /** Root routing context segment for the authentication module framework. */
    root: 'auth',
    /** Absolute route location targeting the user session login portal view. */
    login: '/auth/login',
    /** Absolute route location targeting the self-service account registration workspace. */
    register: '/auth/register',
  },

  /**
   * Protected administrative backoffice layout boundaries.
   * Restricts data manipulation views exclusively to validated system operators.
   */
  admin: {
    /** Root core segment identifying the administration panel navigation tree. */
    root: 'admin',
    /** Absolute URL addressing the central analytics operational dashboard. */
    dashboard: '/admin/dashboard',

    /**
     * Account management view coordinates.
     * Handles administrative user manipulation routines and lifecycle workflows.
     */
    users: {
      /** Absolute gateway endpoint for retrieving the corporate users data grid. */
      root: '/admin/users',
      /** Navigation link pointing to the user account creation wizard form. */
      new: '/admin/users/new',
      /**
       * Dynamic route resolution blueprint for modifying existing user metrics.
       * 
       * @param id - Unique database primary identifier key of the selected profile entity.
       * @returns Interpolated absolute route string mapping toward the targeted editing module.
       */
      edit: (id: string | number) => `/admin/users/edit/${id}`
    },

    /**
     * Library system assets inventory configurations.
     * Houses structural navigation indexes for item auditing and collection catalogs.
     */
    books: {
      /** Absolute path leading directly to the primary book catalog management layout. */
      root: '/admin/books',
      /** Navigation pathway pointing toward the catalog index ingestion utility form. */
      new: '/admin/books/new',
      /**
       * Dynamic route resolution selector for modifying collection item records.
       * 
       * @param id - Unique operational identifier serial assigned to the physical or digital volume.
       * @returns Interpolated absolute path reference pointing to the item's details editor.
       */
      edit: (id: string | number) => `/admin/books/edit/${id}`
    },

    /**
     * Operational intelligence tracking records.
     * Restricts navigation strictly to audit trail inspectors.
     */
    logs: {
      /** Absolute path displaying centralized system event streams and database audit footprints. */
      root: '/admin/logs'
    }
  }
} as const;