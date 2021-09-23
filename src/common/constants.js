/**
 * This module contains application constants
 */

module.exports = {

  // The trait id under which the onboarding checklist traits will be stored
  ONBOARDING_CHECKLIST_TRAIT_ID: 'onboarding_checklist',

  ONBOARDING_CHECKLIST_CATEGORY_NAME: 'Onboarding Checklist',

  // The property name to use to store the standard terms in traits body
  STANDARD_TERMS_TRAIT_PROPERTY_NAME: 'standard_terms',

  // The property name to use to store the nda terms in traits body
  NDA_TERMS_TRAIT_PROPERTY_NAME: 'nda_terms',

  // The property name to use to store the tax form submitted in traits body
  TAX_FORM_TRAIT_PROPERTY_NAME: 'tax_form_submitted',
  TAX_FORM_TRAIT_PROPERTY_NAME_MAP: { 'w9_tax_form_submitted': 'W-9', 'w8ben_tax_form_submitted': 'W-8BEN' },

  CHECKLIST_STATUS: {
    COMPLETED: 'completed'
  },

  CHECKLIST_MESSAGE: {
    SUCCESS: 'success'
  }
}
