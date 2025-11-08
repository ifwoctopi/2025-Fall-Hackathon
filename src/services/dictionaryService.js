import { supabase } from '../config/supabase';

/**
 * Search the medical dictionary for terms
 * @param {string} searchTerm - The term to search for
 * @param {boolean} useFullTextSearch - Use full-text search (default: false)
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const searchDictionary = async (searchTerm, useFullTextSearch = false) => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return { data: [], error: null };
    }

    // Direct query to include why_matters field
    const { data, error } = await supabase
      .from('dictionary')
      .select('id, medical_term, definition, why_matters')
      .or(`medical_term.ilike.%${searchTerm.trim()}%,definition.ilike.%${searchTerm.trim()}%`)
      .order('medical_term', { ascending: true })
      .limit(50);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error searching dictionary:', error);
    return { data: null, error };
  }
};

/**
 * Get a specific term from the dictionary
 * @param {string} term - The exact medical term
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export const getDictionaryTerm = async (term) => {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('id, medical_term, definition, why_matters')
      .ilike('medical_term', term)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return { data: data || null, error: null };
  } catch (error) {
    console.error('Error getting dictionary term:', error);
    return { data: null, error };
  }
};

/**
 * Get all dictionary terms (with pagination)
 * @param {number} limit - Number of terms to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export const getAllDictionaryTerms = async (limit = 1000, offset = 0) => {
  try {
    const { data, error } = await supabase
      .from('dictionary')
      .select('id, medical_term, definition, why_matters')
      .order('medical_term', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error getting dictionary terms:', error);
    return { data: null, error };
  }
};



